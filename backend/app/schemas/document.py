from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from app.models.enums import DocumentType, DocumentStatus

class DocumentResponse(BaseModel):
    id: UUID
    application_id: UUID
    document_type: DocumentType
    file_name: Optional[str]
    file_size_kb: Optional[int]
    mime_type: Optional[str]
    status: DocumentStatus
    ocr_confidence: Optional[float]
    validation_notes: Optional[str]
    extracted_data: Dict[str, Any] | List[Any]
    is_bank_statement: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    upload_id: UUID
    message: str
    document: DocumentResponse

class PassportConfirmRequest(BaseModel):
    surname: Optional[str] = None
    given_names: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    expiry_date: Optional[str] = None
    passport_number: Optional[str] = None


class ChecklistProgressResponse(BaseModel):
    total: int
    completed: int
    remaining: List[str]
    is_all_complete: bool


class BankStatementValidationResponse(BaseModel):
    name_match: bool
    name_confidence: float
    statement_period: str
    is_recent_enough: bool
    balance_detected: float
    currency: str
    warnings: List[str]


class SupportingDocumentUploadResponse(BaseModel):
    document_id: UUID
    document_type: str
    status: str
    validation_notes: Optional[str] = None
    checklist_progress: ChecklistProgressResponse
    next_required: Optional[str] = None
    bank_statement_validation: Optional[BankStatementValidationResponse] = None

