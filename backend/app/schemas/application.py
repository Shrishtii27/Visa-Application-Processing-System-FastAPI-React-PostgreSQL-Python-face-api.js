from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from app.models.enums import ApplicationStep, ApplicationStatus
from app.schemas.visa import VisaRequirementResponse

class ApplicationCreate(BaseModel):
    # This can be empty, or you can add fields if needed later.
    pass

class ApplicationUpdateCountry(BaseModel):
    country_code: str
    visa_type_id: UUID
    applicant_nationality: str

class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    visa_type_id: Optional[UUID] = None
    applicant_nationality: Optional[str] = None
    step: ApplicationStep
    status: ApplicationStatus
    form_data: Dict[str, Any] | List[Any]
    passport_mrz_data: Dict[str, Any] | List[Any]
    face_score: Optional[float] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicationStatusResponse(BaseModel):
    step: ApplicationStep
    status: ApplicationStatus
    form_data: Dict[str, Any] | List[Any]
    passport_mrz_data: Dict[str, Any] | List[Any]
    face_score: Optional[float] = None

class ApplicationCountryUpdateResponse(BaseModel):
    application: ApplicationResponse
    requirements: List[VisaRequirementResponse]

class FormDataRequest(BaseModel):
    form_data: Dict[str, Any]

class ApplicationFormDataResponse(BaseModel):
    application: ApplicationResponse
    requirements: List[VisaRequirementResponse]


