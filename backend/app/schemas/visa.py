from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.models.enums import VisaPurpose, DocumentType

# Visa Type Schemas
class VisaTypeBase(BaseModel):
    country_code: str
    purpose: VisaPurpose
    visa_name: str
    duration_days: Optional[int] = None
    max_stay_days: Optional[int] = None
    is_multiple_entry: bool = False
    fee_usd: Optional[float] = None
    processing_time_days: Optional[int] = None
    is_active: bool = True
    description: Optional[str] = None

class VisaTypeResponse(VisaTypeBase):
    id: UUID
    class Config:
        from_attributes = True

# Visa Requirement Schemas
class VisaRequirementBase(BaseModel):
    visa_type_id: UUID
    applicant_nationality: str
    document_type: DocumentType
    document_label: str
    is_mandatory: bool = True
    max_age_days: Optional[int] = None
    min_validity_days: Optional[int] = None
    notes: Optional[str] = None
    display_order: int = 0

class VisaRequirementResponse(VisaRequirementBase):
    id: UUID
    class Config:
        from_attributes = True

# Form Field Schemas
class FormFieldBase(BaseModel):
    visa_type_id: UUID
    applicant_nationality: str
    field_name: str
    field_label: str
    field_type: str
    is_required: bool = True
    options: List[Dict[str, Any] | str] | Dict[str, Any] = []
    validation_regex: Optional[str] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    display_order: int = 0

class FormFieldResponse(FormFieldBase):
    id: UUID
    class Config:
        from_attributes = True
