import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.requirement import VisaRequirement
from app.models.enums import ApplicationStep, ApplicationStatus

async def create_application(db: AsyncSession, user_id: uuid.UUID) -> Application:
    """
    Creates a new draft application and records the start event in the audit log.
    """
    new_app = Application(
        user_id=user_id,
        step=ApplicationStep.country_selection,
        status=ApplicationStatus.draft
    )
    db.add(new_app)
    await db.flush()

    # Create audit log
    audit_log = AuditLog(
        application_id=new_app.id,
        user_id=user_id,
        event_type="application_started",
        payload={"step": new_app.step.value, "status": new_app.status.value}
    )
    db.add(audit_log)
    await db.flush()
    
    return new_app

async def update_application_country(
    db: AsyncSession,
    application_id: uuid.UUID,
    user_id: uuid.UUID,
    country_code: str,
    visa_type_id: uuid.UUID,
    applicant_nationality: str
) -> tuple[Application | None, list[VisaRequirement]]:
    """
    Updates the application country and visa type details, sets step to passport_upload,
    and logs the action in the audit log.
    """
    # Fetch application
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        return None, []

    # Update app attributes
    app.visa_type_id = visa_type_id
    app.applicant_nationality = applicant_nationality
    app.step = ApplicationStep.passport_upload

    # Create audit log
    audit_log = AuditLog(
        application_id=app.id,
        user_id=user_id,
        event_type="country_selected",
        payload={
            "country_code": country_code,
            "visa_type_id": str(visa_type_id),
            "applicant_nationality": applicant_nationality
        }
    )
    db.add(audit_log)
    await db.flush()

    # Query requirements for this visa type
    req_result = await db.execute(
        select(VisaRequirement).where(
            VisaRequirement.visa_type_id == visa_type_id
        ).order_by(VisaRequirement.display_order)
    )
    requirements = req_result.scalars().all()

    return app, requirements


class FormValidationError(Exception):
    def __init__(self, errors: dict[str, str]):
        self.errors = errors
        super().__init__("Form validation failed")


async def save_form_data(
    db: AsyncSession,
    application_id: uuid.UUID,
    user_id: uuid.UUID,
    form_data: dict
) -> tuple[Application, list[VisaRequirement]]:
    """
    Validates form data, saves it to the application, advances the step to document_upload,
    and logs the action in the audit log.
    """
    # Fetch application
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise ValueError("Application not found")

    # Run validation
    from app.services.visa.form_validator import validate_form_data
    is_valid, errors = await validate_form_data(
        db=db,
        visa_type_id=app.visa_type_id,
        applicant_nationality=app.applicant_nationality,
        form_data=form_data
    )

    if not is_valid:
        raise FormValidationError(errors)

    # Update app attributes
    app.form_data = form_data
    app.step = ApplicationStep.document_upload

    # Create audit log
    audit_log = AuditLog(
        application_id=app.id,
        user_id=user_id,
        event_type="form_data_saved",
        payload={
            "step": app.step.value,
            "status": app.status.value
        }
    )
    db.add(audit_log)
    await db.flush()

    # Query requirements for this visa type
    req_result = await db.execute(
        select(VisaRequirement).where(
            VisaRequirement.visa_type_id == app.visa_type_id,
            VisaRequirement.applicant_nationality.in_(['ALL', app.applicant_nationality])
        ).order_by(VisaRequirement.display_order)
    )
    requirements = req_result.scalars().all()

    return app, requirements

