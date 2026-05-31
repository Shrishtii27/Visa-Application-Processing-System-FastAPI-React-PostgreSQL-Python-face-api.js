import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.requirement import VisaRequirement
from app.models.checklist import ApplicationChecklist
from app.models.document import UploadedDocument
from app.models.enums import DocumentType

async def generate_checklist_rows(
    db: AsyncSession,
    application_id: uuid.UUID,
    visa_type_id: uuid.UUID,
    applicant_nationality: str
) -> list[ApplicationChecklist]:
    """
    Generates application checklist rows in the database for the given application.
    If checklist rows already exist, they are cleared first.
    """
    # 1. Clear existing checklist items for this application to avoid mismatch
    await db.execute(
        delete(ApplicationChecklist).where(ApplicationChecklist.application_id == application_id)
    )
    await db.flush()

    # 2. Query requirements for this visa type
    # Match both applicant_nationality and 'ALL' requirements
    reqs_result = await db.execute(
        select(VisaRequirement).where(
            VisaRequirement.visa_type_id == visa_type_id,
            VisaRequirement.applicant_nationality.in_(['ALL', applicant_nationality])
        )
    )
    visa_reqs = reqs_result.scalars().all()

    # 3. Find if there's any existing passport document to link
    passport_doc_id = None
    doc_result = await db.execute(
        select(UploadedDocument)
        .where(
            UploadedDocument.application_id == application_id,
            UploadedDocument.document_type == DocumentType.passport
        )
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    passport_doc = doc_result.scalars().first()
    if passport_doc:
        passport_doc_id = passport_doc.id

    new_checklists = []
    for vr in visa_reqs:
        link_doc_id = passport_doc_id if vr.document_type == DocumentType.passport else None
        is_completed = True if vr.document_type == DocumentType.passport and passport_doc_id else False
        notes = "Linked automatically from passport scan" if vr.document_type == DocumentType.passport and passport_doc_id else None

        checklist_item = ApplicationChecklist(
            application_id=application_id,
            requirement_id=vr.id,
            document_id=link_doc_id,
            is_completed=is_completed,
            notes=notes
        )
        db.add(checklist_item)
        new_checklists.append(checklist_item)

    await db.flush()
    return new_checklists


from app.models.enums import ApplicationStep
from app.models.application import Application
from app.models.audit_log import AuditLog
from sqlalchemy import func


async def update_checklist(
    db: AsyncSession,
    application_id: uuid.UUID,
    document_type: DocumentType,
    document_id: uuid.UUID
) -> ApplicationChecklist | None:
    """
    Finds the checklist row for this document type, marks it complete and links the document.
    """
    result = await db.execute(
        select(ApplicationChecklist)
        .join(VisaRequirement, ApplicationChecklist.requirement_id == VisaRequirement.id)
        .where(
            ApplicationChecklist.application_id == application_id,
            VisaRequirement.document_type == document_type
        )
    )
    item = result.scalars().first()
    if item:
        item.is_completed = True
        item.document_id = document_id
        item.completed_at = func.now()
        await db.flush()
    return item


async def get_progress(
    db: AsyncSession,
    application_id: uuid.UUID
) -> dict:
    """
    Returns progress information of the checklist.
    """
    result = await db.execute(
        select(ApplicationChecklist, VisaRequirement)
        .join(VisaRequirement, ApplicationChecklist.requirement_id == VisaRequirement.id)
        .where(ApplicationChecklist.application_id == application_id)
    )
    items = result.all()

    total_mandatory = 0
    completed_mandatory = 0
    remaining_mandatory_types = []

    for cl, vr in items:
        if vr.is_mandatory:
            total_mandatory += 1
            if cl.is_completed:
                completed_mandatory += 1
            else:
                remaining_mandatory_types.append(vr.document_type.value)

    total_all = len(items)
    completed_all = sum(1 for cl, _ in items if cl.is_completed)
    is_all_complete = completed_mandatory == total_mandatory

    return {
        "total": total_mandatory,
        "completed": completed_mandatory,
        "remaining": remaining_mandatory_types,
        "is_all_complete": is_all_complete,
        "total_all": total_all,
        "completed_all": completed_all
    }


async def check_advance_step(
    db: AsyncSession,
    application_id: uuid.UUID,
    user_id: uuid.UUID
) -> bool:
    """
    If all mandatory checklist items are complete, advance step to face_verification
    and write audit log.
    """
    progress = await get_progress(db, application_id)
    if progress["is_all_complete"]:
        app_result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = app_result.scalars().first()
        if app and app.step == ApplicationStep.document_upload:
            app.step = ApplicationStep.face_verification
            
            # Create audit log
            audit_log = AuditLog(
                application_id=application_id,
                user_id=user_id,
                event_type="document_upload_completed",
                payload={
                    "step": app.step.value if hasattr(app.step, "value") else str(app.step),
                    "status": app.status.value if (app.status and hasattr(app.status, "value")) else str(app.status)
                }
            )
            db.add(audit_log)
            await db.flush()
            return True
    return False

