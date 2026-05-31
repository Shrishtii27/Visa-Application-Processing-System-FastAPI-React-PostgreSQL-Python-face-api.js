import uuid
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.application import Application
from app.models.document import UploadedDocument
from app.models.audit_log import AuditLog
from app.models.checklist import ApplicationChecklist
from app.models.requirement import VisaRequirement
from app.models.enums import (
    DocumentType,
    DocumentStatus,
    ApplicationStep,
    ApplicationStatus,
)
from app.schemas.face import (
    LivenessRequest,
    LivenessResponse,
    FaceResultRequest,
    FaceResultResponse,
)
from app.services.face.face_service import face_service


router = APIRouter()


# ─── 1. GET passport image ──────────────────────────────────────────────

@router.get("/{id}/face/passport-image")
async def get_passport_image(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the passport image file for face comparison in the browser."""
    user_id = uuid.UUID(current_user["sub"])

    # Verify application belongs to current user
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get passport document
    doc_result = await db.execute(
        select(UploadedDocument)
        .where(
            UploadedDocument.application_id == id,
            UploadedDocument.document_type == DocumentType.passport,
        )
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    passport_doc = doc_result.scalars().first()
    if not passport_doc:
        raise HTTPException(
            status_code=404, detail="Passport document not found. Please upload it first."
        )

    # Verify file exists on disk
    if not os.path.exists(passport_doc.file_path):
        raise HTTPException(status_code=404, detail="Passport image file not found on disk")

    return FileResponse(
        passport_doc.file_path,
        media_type=passport_doc.mime_type or "image/jpeg",
        filename="passport.jpg",
    )


# ─── 2. POST liveness result ────────────────────────────────────────────

@router.post("/{id}/face/liveness", response_model=LivenessResponse)
async def submit_liveness(
    id: uuid.UUID,
    request: LivenessRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Store liveness challenge result from the browser."""
    user_id = uuid.UUID(current_user["sub"])

    # Verify application belongs to current user
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Validate application step
    if app.step != ApplicationStep.face_verification:
        raise HTTPException(
            status_code=400,
            detail=f"Application is at step '{app.step.value}', expected 'face_verification'",
        )

    try:
        # Save liveness result to form_data JSONB
        form_data = dict(app.form_data) if app.form_data else {}
        form_data["liveness"] = {
            "passed": request.liveness_passed,
            "challenge_type": request.challenge_type,
            "motion_frames": request.motion_frames_detected,
            "total_frames": request.total_frames,
            "checked_at": datetime.now().isoformat(),
        }
        app.form_data = form_data

        # Create audit log
        audit_log = AuditLog(
            application_id=id,
            user_id=user_id,
            event_type="liveness_checked",
            payload={
                "challenge": request.challenge_type,
                "passed": request.liveness_passed,
                "motion_frames": request.motion_frames_detected,
            },
        )
        db.add(audit_log)

        await db.commit()

        return LivenessResponse(
            success=True,
            application_id=str(id),
            liveness_passed=request.liveness_passed,
            message="Liveness check recorded successfully",
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to save liveness result: {str(e)}"
        )


# ─── 3. POST face verification result ───────────────────────────────────

@router.post("/{id}/face/result", response_model=FaceResultResponse)
async def submit_face_result(
    id: uuid.UUID,
    request: FaceResultRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Receive face comparison results from the browser, apply thresholds,
    update application status, and return final verdict.
    """
    user_id = uuid.UUID(current_user["sub"])

    # Verify application belongs to current user
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get retry count for logging
    retry_count = await face_service.get_retry_count(id, db)

    try:
        # Save selfie image
        file_path = face_service.save_selfie(str(id), request.selfie_image)

        # Insert into uploaded_documents
        selfie_doc = UploadedDocument(
            application_id=id,
            document_type=DocumentType.photograph,
            file_path=file_path,
            file_name="selfie.jpg",
            mime_type="image/jpeg",
            status=DocumentStatus.valid,
        )
        db.add(selfie_doc)
        await db.flush()  # Get selfie_doc.id

        # AI Decision — binary only based on distance threshold
        THRESHOLD = 0.48
        if request.liveness_passed and request.distance < THRESHOLD:
            final_status = 'approved'
            message = 'Identity verified successfully'
            can_retry = False
            reason = None
        else:
            final_status = 'rejected'
            can_retry = True

            # Specific rejection reason
            if not request.liveness_passed:
                reason = 'Liveness check failed. Please ensure you complete the challenge correctly.'
            elif request.distance > 0.55:
                reason = 'Face does not match passport photo. Please ensure good lighting.'
            else:
                reason = 'Face match score too low. Please retake in better lighting.'

            message = reason

        # Update applications table
        app.face_score = request.match_score

        if final_status == 'approved':
            app.status = ApplicationStatus.approved
        else:
            app.status = ApplicationStatus.rejected

        app.step = ApplicationStep.completed
        app.updated_at = datetime.now()

        # Update application_checklists for photograph requirement
        checklist_result = await db.execute(
            select(ApplicationChecklist)
            .join(
                VisaRequirement,
                ApplicationChecklist.requirement_id == VisaRequirement.id,
            )
            .where(
                ApplicationChecklist.application_id == id,
                VisaRequirement.document_type == DocumentType.photograph,
            )
        )
        checklist_item = checklist_result.scalars().first()
        if checklist_item:
            checklist_item.is_completed = True
            checklist_item.document_id = selfie_doc.id
            checklist_item.completed_at = datetime.now()

        # Create audit log
        audit_log = AuditLog(
            application_id=id,
            user_id=user_id,
            event_type="face_verified",
            payload={
                "match_score": request.match_score,
                "distance": request.distance,
                "liveness_passed": request.liveness_passed,
                "final_status": final_status,
                "reason": reason,
                "attempt": retry_count + 1,
            },
        )
        db.add(audit_log)

        await db.commit()

        # Determine next step based on final status
        if final_status == "approved":
            next_step = "package_generation"
        else:
            next_step = "face_verification"

        return FaceResultResponse(
            success=True,
            application_id=str(id),
            match_score=request.match_score,
            final_status=final_status,
            message=message,
            reason=reason,
            can_retry=can_retry,
            retry_count=retry_count + 1,
            next_step=next_step,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process face verification result: {str(e)}",
        )
