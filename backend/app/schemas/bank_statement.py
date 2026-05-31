from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class DocumentQualityReport(BaseModel):
    status: str
    confidence: float
    is_bank_statement_confirmed: bool

class NameValidationReport(BaseModel):
    status: str
    passport_name: str
    statement_name: str
    match_score: float
    message: str

class DateValidationReport(BaseModel):
    status: str
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    months_covered: float
    required_months: int
    is_recent: bool
    days_old: int

class BalanceValidationReport(BaseModel):
    status: str
    detected_balance: float
    currency: str
    minimum_required: float
    shortfall: float
    message: str

class BankStatementValidationResponse(BaseModel):
    validation_id: UUID
    document_id: UUID
    overall_status: str
    can_proceed: bool
    document_quality: DocumentQualityReport
    name_validation: NameValidationReport
    date_validation: DateValidationReport
    balance_validation: BalanceValidationReport
    issues: List[str]
    warnings: List[str]
    checklist_updated: bool
    next_step: str
