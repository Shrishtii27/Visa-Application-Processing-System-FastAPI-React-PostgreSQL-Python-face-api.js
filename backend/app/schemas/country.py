from pydantic import BaseModel, Field
from typing import Optional

class CountryBase(BaseModel):
    country_code: str = Field(..., max_length=3)
    country_name: str = Field(..., max_length=100)
    region: Optional[str] = None
    flag_emoji: Optional[str] = None
    processing_time_days: Optional[int] = None
    visa_fee_usd: Optional[float] = None
    embassy_url: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class CountryResponse(CountryBase):
    class Config:
        from_attributes = True
