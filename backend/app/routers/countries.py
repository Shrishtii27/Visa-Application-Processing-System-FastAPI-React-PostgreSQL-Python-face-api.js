import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.country import DestinationCountry
from app.models.visa_type import VisaType
from app.models.requirement import VisaRequirement
from app.models.field_config import FormFieldConfig
from app.schemas.country import CountryResponse
from app.schemas.visa import VisaTypeResponse, VisaRequirementResponse, FormFieldResponse

router = APIRouter()

@router.get("", response_model=List[CountryResponse])
async def get_countries(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(DestinationCountry).where(DestinationCountry.is_active == True))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch countries: {str(e)}")

@router.get("/{code}", response_model=CountryResponse)
async def get_country(code: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(DestinationCountry).where(DestinationCountry.country_code == code.upper())
        )
        country = result.scalars().first()
        if not country:
            raise HTTPException(status_code=404, detail="Country not found")
        return country
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch country: {str(e)}")

@router.get("/{code}/visa-types", response_model=List[VisaTypeResponse])
async def get_visa_types(code: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(VisaType).where(
                VisaType.country_code == code.upper(),
                VisaType.is_active == True
            )
        )
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch visa types: {str(e)}")

@router.get("/{code}/visa-types/{id}", response_model=VisaTypeResponse)
async def get_visa_type(code: str, id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(VisaType).where(
                VisaType.id == id,
                VisaType.country_code == code.upper()
            )
        )
        visa_type = result.scalars().first()
        if not visa_type:
            raise HTTPException(status_code=404, detail="Visa type not found")
        return visa_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch visa type: {str(e)}")

@router.get("/{code}/visa-types/{id}/requirements", response_model=List[VisaRequirementResponse])
async def get_visa_requirements(code: str, id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    try:
        # First check if the visa exists and belongs to the country
        visa_check = await db.execute(select(VisaType).where(VisaType.id == id, VisaType.country_code == code.upper()))
        if not visa_check.scalars().first():
            raise HTTPException(status_code=404, detail="Visa type not found")

        result = await db.execute(
            select(VisaRequirement).where(VisaRequirement.visa_type_id == id).order_by(VisaRequirement.display_order)
        )
        return result.scalars().all()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch requirements: {str(e)}")

@router.get("/{code}/visa-types/{id}/form-fields", response_model=List[FormFieldResponse])
async def get_visa_form_fields(code: str, id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    try:
        # First check if the visa exists
        visa_check = await db.execute(select(VisaType).where(VisaType.id == id, VisaType.country_code == code.upper()))
        if not visa_check.scalars().first():
            raise HTTPException(status_code=404, detail="Visa type not found")

        result = await db.execute(
            select(FormFieldConfig).where(FormFieldConfig.visa_type_id == id).order_by(FormFieldConfig.display_order)
        )
        return result.scalars().all()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch form fields: {str(e)}")
