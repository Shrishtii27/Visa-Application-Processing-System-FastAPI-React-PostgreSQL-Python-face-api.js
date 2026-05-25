import uuid
from sqlalchemy import String, Integer, Numeric, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.enums import VisaPurpose

class VisaType(Base):
    __tablename__ = 'visa_types'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    country_code: Mapped[str] = mapped_column(String(3), ForeignKey('destination_countries.country_code', ondelete='CASCADE'), nullable=False)
    purpose: Mapped[VisaPurpose] = mapped_column(Enum(VisaPurpose, name="visa_purpose"), nullable=False)
    visa_name: Mapped[str] = mapped_column(String(200), nullable=False)
    duration_days: Mapped[int | None] = mapped_column(Integer)
    max_stay_days: Mapped[int | None] = mapped_column(Integer)
    is_multiple_entry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fee_usd: Mapped[float | None] = mapped_column(Numeric(10, 2))
    processing_time_days: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
