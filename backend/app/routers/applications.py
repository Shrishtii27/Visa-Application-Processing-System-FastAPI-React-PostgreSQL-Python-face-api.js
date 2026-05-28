import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.requirement import VisaRequirement
from app.models.enums import ApplicationStep, ApplicationStatus
from app.models.visa_type import VisaType
from app.models.country import DestinationCountry
from fastapi.responses import FileResponse
from app.services.visa.pdf_generator import pdf_generator
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdateCountry,
    ApplicationResponse,
    ApplicationStatusResponse,
    ApplicationCountryUpdateResponse,
    FormDataRequest,
    ApplicationFormDataResponse
)

from app.services.visa import application_service, checklist_service
from app.services.visa.application_service import FormValidationError


router = APIRouter()

@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = uuid.UUID(current_user["sub"])
        new_app = await application_service.create_application(db, user_id)
        await db.commit()
        await db.refresh(new_app)
        return new_app
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")

@router.patch("/{id}/country", response_model=ApplicationCountryUpdateResponse)
async def update_application_country(
    id: uuid.UUID,
    update_data: ApplicationUpdateCountry,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    try:
        # 1. Update Application via Service
        app, requirements = await application_service.update_application_country(
            db=db,
            application_id=id,
            user_id=user_id,
            country_code=update_data.country_code,
            visa_type_id=update_data.visa_type_id,
            applicant_nationality=update_data.applicant_nationality
        )
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
            
        # 2. Generate Checklist Rows via Service
        await checklist_service.generate_checklist_rows(
            db=db,
            application_id=id,
            visa_type_id=update_data.visa_type_id,
            applicant_nationality=update_data.applicant_nationality
        )
        
        await db.commit()
        await db.refresh(app)
        
        return {
            "application": app,
            "requirements": requirements
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}")

@router.get("/{id}/status", response_model=ApplicationStatusResponse)
async def get_application_status(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    result = await db.execute(select(Application).where(Application.id == id, Application.user_id == user_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return {
        "step": app.step,
        "status": app.status,
        "form_data": app.form_data,
        "passport_mrz_data": app.passport_mrz_data,
        "face_score": app.face_score
    }


@router.patch("/{id}/form-data", response_model=ApplicationFormDataResponse)
async def save_form_data(
    id: uuid.UUID,
    form_data_in: FormDataRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    try:
        app, requirements = await application_service.save_form_data(
            db=db,
            application_id=id,
            user_id=user_id,
            form_data=form_data_in.form_data
        )
        await db.commit()
        await db.refresh(app)
        return {
            "application": app,
            "requirements": requirements
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except FormValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.errors)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save form data: {str(e)}")


@router.get("/{id}/form-data")
async def get_form_data(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == user_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    return {"form_data": app.form_data}


import os

@router.get("/{id}/summary-pdf")
async def download_summary_pdf(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    result = await db.execute(select(Application).where(Application.id == id, Application.user_id == user_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    try:
        visa_type = None
        country = None
        if app.visa_type_id:
            vt_result = await db.execute(select(VisaType).where(VisaType.id == app.visa_type_id))
            visa_type = vt_result.scalars().first()
            if visa_type:
                c_result = await db.execute(select(DestinationCountry).where(DestinationCountry.country_code == visa_type.country_code))
                country = c_result.scalars().first()
                
        app_dict = {
            "id": str(app.id),
            "status": app.status.value if app.status else "Unknown",
            "step": app.step.value if app.step else "Unknown",
            "passport_mrz_data": app.passport_mrz_data,
            "form_data": app.form_data,
            "face_score": float(app.face_score) if app.face_score else "N/A",
            "destination_country_name": country.country_name if country else "Unknown",
            "visa_type_name": visa_type.visa_name if visa_type else "Unknown",
            "embassy_url": country.embassy_url if country and country.embassy_url else f"https://www.google.com/search?q={country.country_name if country else ''}+embassy",
            "processing_time_days": country.processing_time_days if country and country.processing_time_days else 15,
            "visa_fee_usd": float(country.visa_fee_usd) if country and country.visa_fee_usd else 130
        }
        
        os.makedirs("uploads/pdfs", exist_ok=True)
        pdf_path = f"uploads/pdfs/POC_Visa_Summary_{id}.pdf"
        
        pdf_generator.generate_application_summary(app_dict, pdf_path)
        
        return FileResponse(
            path=pdf_path,
            filename=f"POC_Visa_Summary_{id}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
