from sqlalchemy import String, Integer, Numeric, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class DestinationCountry(Base):
    __tablename__ = 'destination_countries'

    country_code: Mapped[str] = mapped_column(String(3), primary_key=True)
    country_name: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100))
    flag_emoji: Mapped[str | None] = mapped_column(String(10))
    processing_time_days: Mapped[int | None] = mapped_column(Integer)
    visa_fee_usd: Mapped[float | None] = mapped_column(Numeric(10, 2))
    embassy_url: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
