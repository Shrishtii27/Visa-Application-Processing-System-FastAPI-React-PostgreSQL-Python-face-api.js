from pydantic import BaseModel
from typing import List, Optional
import uuid

class PackageItem(BaseModel):
    name: str
    type: str
    status: str
    file_name: Optional[str] = None

class PackagePreviewResponse(BaseModel):
    application_id: uuid.UUID
    applicant_name: str
    destination: str
    visa_type: str
    package_contents: List[PackageItem]
    total_documents: int
    embassy_url: str
    processing_time_days: int
    visa_fee_usd: int
    is_ready: bool

class PackageGenerateResponse(BaseModel):
    success: bool
    application_id: uuid.UUID
    package_name: str
    download_url: str
    generated_at: str
    file_size_kb: int
    total_documents: int
