import uuid
import os
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.application import Application
from app.models.document import UploadedDocument
from app.models.audit_log import AuditLog
from app.models.enums import DocumentType, DocumentStatus, ApplicationStep
from app.schemas.document import (
    UploadResponse,
    PassportConfirmRequest,
    SupportingDocumentUploadResponse,
    DocumentResponse
)
from app.services import upload_service
from app.services.ocr import mrz_extractor, country_validator
from app.services.ocr.mrz_extractor import parse_mrz_date
from app.models.visa_type import VisaType
from app.models.requirement import VisaRequirement
from app.models.checklist import ApplicationChecklist
from app.services.visa import checklist_service


router = APIRouter()

@router.post("/{application_id}/documents/passport", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_passport(
    application_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Verify application belongs to user
    result = await db.execute(select(Application).where(Application.id == application_id, Application.user_id == user_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    try:
        # 2. Validate and Save File
        file_path, file_size_kb, mime_type = await upload_service.validate_and_save_uploaded_file(
            file=file, 
            application_id=application_id, 
            document_type="passports"
        )
        
        # 3. Create UploadedDocument Record
        document = UploadedDocument(
            application_id=application_id,
            document_type=DocumentType.passport,
            file_path=file_path,
            file_name=file.filename,
            file_size_kb=file_size_kb,
            mime_type=mime_type,
            status=DocumentStatus.pending
        )
        db.add(document)
        
        # 5. Create Audit Log
        audit_log = AuditLog(
            application_id=application_id,
            user_id=user_id,
            event_type="passport_uploaded",
            payload={
                "file_name": file.filename,
                "file_size_kb": file_size_kb,
                "mime_type": mime_type
            }
        )
        db.add(audit_log)
        
        await db.commit()
        await db.refresh(document)
        
        return {
            "upload_id": document.id,
            "message": "Passport uploaded successfully",
            "document": document
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.post("/{application_id}/passport/scan", status_code=status.HTTP_200_OK)
async def scan_passport(
    application_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Verify application belongs to user
    result = await db.execute(select(Application).where(Application.id == application_id, Application.user_id == user_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # 2. Get latest uploaded passport document for this application
    doc_result = await db.execute(
        select(UploadedDocument)
        .where(
            UploadedDocument.application_id == application_id,
            UploadedDocument.document_type == DocumentType.passport
        )
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    passport_doc = doc_result.scalars().first()
    if not passport_doc:
        raise HTTPException(status_code=404, detail="Passport document not found. Please upload it first.")
        
    try:
        # 3. Perform MRZ Scan
        scan_results = mrz_extractor.perform_mrz_scan(passport_doc.file_path)
        
        # 4. Determine destination country and rules
        country_code = "US"  # fallback
        min_validity_days = 180  # fallback
        
        if app.visa_type_id:
            vt_result = await db.execute(select(VisaType).where(VisaType.id == app.visa_type_id))
            visa_type = vt_result.scalars().first()
            if visa_type:
                country_code = visa_type.country_code
                
            req_result = await db.execute(
                select(VisaRequirement).where(
                    VisaRequirement.visa_type_id == app.visa_type_id,
                    VisaRequirement.document_type == DocumentType.passport
                )
            )
            req = req_result.scalars().first()
            if req and req.min_validity_days:
                min_validity_days = req.min_validity_days
                
        # 5. Run Country-Specific Validation Rules
        country_check = country_validator.validate_country_rules(scan_results, country_code, min_validity_days)
        
        # 6. Format fields to be JSON serializable
        fields = scan_results["fields"]
        serialized_fields = {}
        for k, v in fields.items():
            if isinstance(v, (date, datetime)):
                serialized_fields[k] = v.isoformat()
            else:
                serialized_fields[k] = v
                
        # Prepare mrz_data for application and document updates
        mrz_data_to_store = {
            "mrz_string": scan_results["mrz_string"],
            "fields": serialized_fields,
            "checksums": scan_results["checksums"],
            "ocr_confidence": scan_results["ocr_confidence"],
            "low_confidence_fields": scan_results["low_confidence_fields"],
            "country_check": country_check
        }
        
        # 7. Update Application State
        app.passport_mrz_data = mrz_data_to_store
        
        # If confidence is high and MRZ checksums are valid, advance step
        is_confident = scan_results["ocr_confidence"] >= 0.70 and scan_results["checksums"].get("is_valid", False)
        if is_confident:
            app.step = ApplicationStep.form_filling
            
        # 8. Update UploadedDocument State
        passport_doc.ocr_confidence = scan_results["ocr_confidence"]
        passport_doc.extracted_data = mrz_data_to_store
        passport_doc.status = DocumentStatus.valid if (is_confident and country_check["valid"]) else DocumentStatus.invalid
        passport_doc.validation_notes = "; ".join(country_check["reasons"]) if country_check["reasons"] else None
        
        # 9. Log Audit Event
        audit_log = AuditLog(
            application_id=application_id,
            user_id=user_id,
            event_type="passport_scanned",
            payload={
                "ocr_confidence": scan_results["ocr_confidence"],
                "is_confident": is_confident,
                "country_check_valid": country_check["valid"],
                "low_confidence_fields": scan_results["low_confidence_fields"]
            }
        )
        db.add(audit_log)
        
        await db.commit()
        
        return {
            "upload_id": passport_doc.id,
            "ocr_confidence": scan_results["ocr_confidence"],
            "fields": serialized_fields,
            "checksums": scan_results["checksums"],
            "low_confidence_fields": scan_results["low_confidence_fields"],
            "country_check": country_check,
            "is_confident": is_confident
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to scan passport: {str(e)}")

@router.post("/{application_id}/passport/confirm", status_code=status.HTTP_200_OK)
async def confirm_passport(
    application_id: uuid.UUID,
    confirm_data: PassportConfirmRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Verify application belongs to user
    result = await db.execute(select(Application).where(Application.id == application_id, Application.user_id == user_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    try:
        # Get existing mrz_data or initialize
        existing_mrz = dict(app.passport_mrz_data) if app.passport_mrz_data else {}
        existing_fields = existing_mrz.get("fields", {})
        
        # Merge corrected values from user
        confirm_dict = confirm_data.model_dump(exclude_unset=True)
        merged_fields = {**existing_fields, **confirm_dict}
        
        # Parse text dates to python date objects for validation
        fields_for_validation = dict(merged_fields)
        for key in ["date_of_birth", "expiry_date"]:
            val = fields_for_validation.get(key)
            if isinstance(val, str):
                parsed = None
                try:
                    parsed = date.fromisoformat(val)
                except ValueError:
                    try:
                        clean_val = val.replace("-", "")
                        if len(clean_val) == 8:
                            parsed = datetime.strptime(clean_val, "%Y%m%d").date()
                        else:
                            parsed = parse_mrz_date(clean_val)
                    except Exception:
                        pass
                if parsed:
                    fields_for_validation[key] = parsed

            
        # 2. Determine destination country and rules
        country_code = "US"  # fallback
        min_validity_days = 180  # fallback
        
        if app.visa_type_id:
            vt_result = await db.execute(select(VisaType).where(VisaType.id == app.visa_type_id))
            visa_type = vt_result.scalars().first()
            if visa_type:
                country_code = visa_type.country_code
                
            req_result = await db.execute(
                select(VisaRequirement).where(
                    VisaRequirement.visa_type_id == app.visa_type_id,
                    VisaRequirement.document_type == DocumentType.passport
                )
            )
            req = req_result.scalars().first()
            if req and req.min_validity_days:
                min_validity_days = req.min_validity_days
                
        # 3. Re-run country-specific validations
        validation_payload = {"fields": fields_for_validation}
        country_check = country_validator.validate_country_rules(validation_payload, country_code, min_validity_days)
        
        # 4. Update passport_mrz_data
        updated_mrz_data = {
            "mrz_string": existing_mrz.get("mrz_string", ""),
            "fields": merged_fields,
            "checksums": existing_mrz.get("checksums", {"is_valid": True}),
            "ocr_confidence": existing_mrz.get("ocr_confidence", 1.0),
            "low_confidence_fields": [],
            "country_check": country_check
        }
        app.passport_mrz_data = updated_mrz_data
        
        # 5. Advance step to form_filling
        app.step = ApplicationStep.form_filling
        
        # 6. Auto-generate checklist rows in application_checklists table
        # Query requirements for this visa type
        if app.visa_type_id:
            reqs_result = await db.execute(
                select(VisaRequirement).where(VisaRequirement.visa_type_id == app.visa_type_id)
            )
            visa_reqs = reqs_result.scalars().all()
            
            # Fetch existing checklist items to avoid duplicates
            existing_checklists_result = await db.execute(
                select(ApplicationChecklist).where(ApplicationChecklist.application_id == application_id)
            )
            existing_checklist_reqs = {c.requirement_id for c in existing_checklists_result.scalars().all()}
            
            # Find latest passport document to link it to the checklist if requirement is passport
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
            
            for vr in visa_reqs:
                if vr.id not in existing_checklist_reqs:
                    link_doc_id = passport_doc_id if vr.document_type == DocumentType.passport else None
                    is_completed = True if vr.document_type == DocumentType.passport else False
                    
                    checklist_item = ApplicationChecklist(
                        application_id=application_id,
                        requirement_id=vr.id,
                        document_id=link_doc_id,
                        is_completed=is_completed,
                        notes="Linked automatically from passport scan" if vr.document_type == DocumentType.passport else None
                    )
                    db.add(checklist_item)
                    
        # 7. Create Audit Log
        audit_log = AuditLog(
            application_id=application_id,
            user_id=user_id,
            event_type="passport_confirmed",
            payload={
                "corrected_fields": list(confirm_dict.keys()),
                "country_check_valid": country_check["valid"]
            }
        )
        db.add(audit_log)
        
        await db.commit()
        await db.refresh(app)
        
        return {
            "application_id": app.id,
            "step": app.step,
            "status": app.status,
            "passport_mrz_data": app.passport_mrz_data,
            "message": "Passport details confirmed and checklist generated successfully."
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to confirm passport details: {str(e)}")


from typing import List

PATH_TO_DOC_TYPE = {
    "bank-statement": (DocumentType.bank_statement, "bank_statements"),
    "flight-ticket": (DocumentType.flight_ticket, "documents"),
    "hotel-booking": (DocumentType.hotel_booking, "documents"),
    "insurance": (DocumentType.travel_insurance, "documents"),
    "employment-letter": (DocumentType.employment_letter, "documents"),
    "national-id": (DocumentType.national_id, "documents"),
    "photograph": (DocumentType.photograph, "faces"),
    "other": (DocumentType.other, "documents")
}


@router.post("/{application_id}/documents/{doc_type_path}", response_model=SupportingDocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_supporting_document(
    application_id: uuid.UUID,
    doc_type_path: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Verify path parameter
    if doc_type_path not in PATH_TO_DOC_TYPE:
        raise HTTPException(status_code=400, detail=f"Invalid document type path: {doc_type_path}")
        
    doc_type, folder_name = PATH_TO_DOC_TYPE[doc_type_path]

    # 2. Verify application belongs to user
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # 3. Validate and Save File
    try:
        file_path, file_size_kb, mime_type = await upload_service.validate_and_save_uploaded_file(
            file=file,
            application_id=application_id,
            document_type=folder_name
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save failed: {str(e)}")

    # 4. Create UploadedDocument
    document = UploadedDocument(
        application_id=application_id,
        document_type=doc_type,
        file_path=file_path,
        file_name=file.filename,
        file_size_kb=file_size_kb,
        mime_type=mime_type,
        status=DocumentStatus.pending
    )
    
    is_bank_stmt = (doc_type == DocumentType.bank_statement)
    document.is_bank_statement = is_bank_stmt

    validation_notes = None
    bs_validation = None
    
    if is_bank_stmt:
        # Run bank statement OCR
        from app.services.ocr.bank_statement_ocr import BankStatementOCR
        ocr_engine = BankStatementOCR()
        
        extracted = ocr_engine.extract(file_path, mime_type)
        
        # Validate holder name against passport name
        passport_name = ""
        if app.passport_mrz_data:
            fields = app.passport_mrz_data.get("fields", {})
            given_names = fields.get("given_names", "")
            surname = fields.get("surname", "")
            passport_name = f"{given_names} {surname}".strip()
            
        name_match, name_conf = ocr_engine.validate_against_passport(
            extracted["account_holder_name"],
            passport_name
        )
        
        # Get requirement limits
        max_age_days = 90
        req_result = await db.execute(
            select(VisaRequirement).where(
                VisaRequirement.visa_type_id == app.visa_type_id,
                VisaRequirement.document_type == DocumentType.bank_statement
            )
        )
        req = req_result.scalars().first()
        if req and req.max_age_days:
            max_age_days = req.max_age_days
            
        is_recent, days_old, recency_warnings = ocr_engine.validate_recency(
            extracted["to_date"],
            max_age_days
        )
        
        # Update document attributes
        document.extracted_data = {
            "account_holder_name": extracted["account_holder_name"],
            "closing_balance": extracted["closing_balance"],
            "currency": extracted["currency"],
            "from_date": extracted["from_date"].isoformat() if extracted["from_date"] else None,
            "to_date": extracted["to_date"].isoformat() if extracted["to_date"] else None,
            "ocr_confidence": extracted["ocr_confidence"]
        }
        document.bank_statement_from_date = extracted["from_date"]
        document.bank_statement_to_date = extracted["to_date"]
        document.bank_statement_min_balance = extracted["closing_balance"]
        
        is_valid = name_match and is_recent
        document.status = DocumentStatus.valid if is_valid else DocumentStatus.invalid
        
        validation_notes = f"Name match: {int(name_conf*100)}%. " + ", ".join(recency_warnings)
        document.validation_notes = validation_notes
        
        bs_validation = {
            "name_match": name_match,
            "name_confidence": name_conf,
            "statement_period": f"{extracted['from_date'].strftime('%b %Y')} - {extracted['to_date'].strftime('%b %Y')}" if extracted["from_date"] else "",
            "is_recent_enough": is_recent,
            "balance_detected": extracted["closing_balance"],
            "currency": extracted["currency"],
            "warnings": recency_warnings
        }
    else:
        document.status = DocumentStatus.valid
        document.extracted_data = {}

    db.add(document)
    await db.flush()

    # 5. Update Application Checklist
    await checklist_service.update_checklist(
        db=db,
        application_id=application_id,
        document_type=doc_type,
        document_id=document.id
    )
    
    # 6. Check if step needs to be advanced
    await checklist_service.check_advance_step(
        db=db,
        application_id=application_id,
        user_id=user_id
    )

    # 7. Create Audit Log
    audit_log = AuditLog(
        application_id=application_id,
        user_id=user_id,
        event_type="document_uploaded",
        payload={
            "document_id": str(document.id),
            "document_type": doc_type.value,
            "status": document.status.value
        }
    )
    db.add(audit_log)
    
    await db.commit()
    await db.refresh(document)

    # 8. Fetch updated checklist progress
    progress = await checklist_service.get_progress(db, application_id)
    next_required = progress["remaining"][0] if progress["remaining"] else None
    
    return {
        "document_id": document.id,
        "document_type": doc_type.value,
        "status": document.status.value,
        "validation_notes": validation_notes,
        "checklist_progress": progress,
        "next_required": next_required,
        "bank_statement_validation": bs_validation
    }


@router.get("/{application_id}/documents", response_model=List[DocumentResponse])
async def list_uploaded_documents(
    application_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    doc_result = await db.execute(
        select(UploadedDocument).where(UploadedDocument.application_id == application_id)
    )
    return doc_result.scalars().all()


@router.delete("/{application_id}/documents/{doc_id}", status_code=status.HTTP_200_OK)
async def delete_uploaded_document(
    application_id: uuid.UUID,
    doc_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    app_result = await db.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    app = app_result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    doc_result = await db.execute(
        select(UploadedDocument).where(
            UploadedDocument.id == doc_id,
            UploadedDocument.application_id == application_id
        )
    )
    doc = doc_result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        print(f"Failed to remove file: {e}")
        
    chk_result = await db.execute(
        select(ApplicationChecklist).where(
            ApplicationChecklist.application_id == application_id,
            ApplicationChecklist.document_id == doc_id
        )
    )
    chk_item = chk_result.scalars().first()
    if chk_item:
        chk_item.is_completed = False
        chk_item.document_id = None
        chk_item.completed_at = None
        
    await db.delete(doc)
    
    progress = await checklist_service.get_progress(db, application_id)
    if not progress["is_all_complete"] and app.step == ApplicationStep.face_verification:
        app.step = ApplicationStep.document_upload
        
    audit_log = AuditLog(
        application_id=application_id,
        user_id=user_id,
        event_type="document_deleted",
        payload={
            "document_id": str(doc_id),
            "document_type": doc.document_type.value
        }
    )
    db.add(audit_log)
    
    await db.commit()
    
    return {"message": "Document deleted successfully"}

