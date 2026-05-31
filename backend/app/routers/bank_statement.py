import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.application import Application
from app.models.document import UploadedDocument
from app.models.enums import DocumentType, DocumentStatus, ApplicationStep
from app.models.audit_log import AuditLog
from app.schemas.bank_statement import BankStatementValidationResponse
from app.services.ocr.bank_statement_validator import BankStatementValidator
from app.services.visa import checklist_service

router = APIRouter()

@router.post("/{id}/bank-statement/validate", response_model=BankStatementValidationResponse)
async def validate_bank_statement(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Fetch application and verify ownership
    app_result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = app_result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # 2. Fetch the latest uploaded bank statement
    doc_result = await db.execute(
        select(UploadedDocument)
        .where(
            UploadedDocument.application_id == id,
            UploadedDocument.document_type == DocumentType.bank_statement
        )
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    bank_stmt_doc = doc_result.scalars().first()
    if not bank_stmt_doc:
        raise HTTPException(
            status_code=404, 
            detail="No uploaded bank statement found for this application. Please upload one first."
        )

    try:
        # 3. Get passport name from applications.passport_mrz_data
        passport_name = ""
        if app.passport_mrz_data:
            fields = app.passport_mrz_data.get("fields", {})
            given_names = fields.get("given_names", "")
            surname = fields.get("surname", "")
            passport_name = f"{given_names} {surname}".strip()

        # 4. Trigger validation
        validator = BankStatementValidator()
        report = await validator.validate(
            db=db,
            application_id=app.id,
            document_id=bank_stmt_doc.id,
            passport_name=passport_name,
            visa_type_id=app.visa_type_id,
            applicant_nationality=app.applicant_nationality
        )

        # 5. Update bank statement UploadedDocument record in DB
        bank_stmt_doc.status = (
            DocumentStatus.valid 
            if report["overall_status"] in ["PASS", "WARNING"] 
            else DocumentStatus.invalid
        )
        bank_stmt_doc.extracted_data = report
        bank_stmt_doc.ocr_confidence = report["document_quality"]["confidence"]
        bank_stmt_doc.validation_notes = "; ".join(report["warnings"] + report["issues"])

        # Save extracted dates and balances to model columns
        date_info = report["date_validation"]
        if date_info.get("from_date"):
            bank_stmt_doc.bank_statement_from_date = date.fromisoformat(date_info["from_date"])
        if date_info.get("to_date"):
            bank_stmt_doc.bank_statement_to_date = date.fromisoformat(date_info["to_date"])
            
        balance_info = report["balance_validation"]
        if balance_info.get("detected_balance") is not None:
            bank_stmt_doc.bank_statement_min_balance = balance_info["detected_balance"]

        # 6. Update Application Checklist
        # Marks bank statement complete and links document
        await checklist_service.update_checklist(
            db=db,
            application_id=app.id,
            document_type=DocumentType.bank_statement,
            document_id=bank_stmt_doc.id
        )
        
        # 7. Check if checklist is complete and step needs to be advanced
        advanced = await checklist_service.check_advance_step(
            db=db,
            application_id=app.id,
            user_id=user_id
        )

        # 8. Create Audit Log for validation event
        audit_log = AuditLog(
            application_id=app.id,
            user_id=user_id,
            event_type="bank_statement_validated",
            payload={
                "document_id": str(bank_stmt_doc.id),
                "overall_status": report["overall_status"],
                "can_proceed": report["can_proceed"],
                "advanced_step": advanced
            }
        )
        db.add(audit_log)

        await db.commit()
        await db.refresh(app)
        
        # Build Response
        report["checklist_updated"] = True
        report["next_step"] = app.step.value if hasattr(app.step, "value") else str(app.step)

        return report

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate bank statement: {str(e)}"
        )

@router.get("/{id}/bank-statement/status", response_model=BankStatementValidationResponse)
async def get_bank_statement_status(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Fetch application and verify ownership
    app_result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = app_result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # 2. Fetch the latest bank statement document
    doc_result = await db.execute(
        select(UploadedDocument)
        .where(
            UploadedDocument.application_id == id,
            UploadedDocument.document_type == DocumentType.bank_statement
        )
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    bank_stmt_doc = doc_result.scalars().first()
    if not bank_stmt_doc:
        raise HTTPException(
            status_code=404, 
            detail="No uploaded bank statement found for this application."
        )

    # 3. Check if validation has already run
    cached_report = bank_stmt_doc.extracted_data
    if (
        isinstance(cached_report, dict) 
        and "overall_status" in cached_report 
        and "document_quality" in cached_report
    ):
        # Already ran, return stored report
        cached_report["checklist_updated"] = True
        cached_report["next_step"] = app.step.value if hasattr(app.step, "value") else str(app.step)
        return cached_report

    # 4. If upload is present but never validated, validate on-the-fly to be self-healing
    try:
        passport_name = ""
        if app.passport_mrz_data:
            fields = app.passport_mrz_data.get("fields", {})
            given_names = fields.get("given_names", "")
            surname = fields.get("surname", "")
            passport_name = f"{given_names} {surname}".strip()

        validator = BankStatementValidator()
        report = await validator.validate(
            db=db,
            application_id=app.id,
            document_id=bank_stmt_doc.id,
            passport_name=passport_name,
            visa_type_id=app.visa_type_id,
            applicant_nationality=app.applicant_nationality
        )

        bank_stmt_doc.status = (
            DocumentStatus.valid 
            if report["overall_status"] in ["PASS", "WARNING"] 
            else DocumentStatus.invalid
        )
        bank_stmt_doc.extracted_data = report
        bank_stmt_doc.ocr_confidence = report["document_quality"]["confidence"]
        bank_stmt_doc.validation_notes = "; ".join(report["warnings"] + report["issues"])

        # Save extracted dates and balances to model columns
        date_info = report["date_validation"]
        if date_info.get("from_date"):
            bank_stmt_doc.bank_statement_from_date = date.fromisoformat(date_info["from_date"])
        if date_info.get("to_date"):
            bank_stmt_doc.bank_statement_to_date = date.fromisoformat(date_info["to_date"])
            
        balance_info = report["balance_validation"]
        if balance_info.get("detected_balance") is not None:
            bank_stmt_doc.bank_statement_min_balance = balance_info["detected_balance"]

        await checklist_service.update_checklist(
            db=db,
            application_id=app.id,
            document_type=DocumentType.bank_statement,
            document_id=bank_stmt_doc.id
        )
        
        await checklist_service.check_advance_step(
            db=db,
            application_id=app.id,
            user_id=user_id
        )

        await db.commit()
        await db.refresh(app)

        report["checklist_updated"] = True
        report["next_step"] = app.step.value if hasattr(app.step, "value") else str(app.step)
        return report

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process on-the-fly validation status: {str(e)}"
        )
