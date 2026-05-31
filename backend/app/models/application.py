import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.enums import ApplicationStep, ApplicationStatus

class Application(Base):
    __tablename__ = 'applications'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False)
    visa_type_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey('visa_types.id', ondelete='CASCADE'), index=True, nullable=True)
    applicant_nationality: Mapped[str | None] = mapped_column(String(3), nullable=True)
    step: Mapped[ApplicationStep] = mapped_column(Enum(ApplicationStep, name="application_step"), default=ApplicationStep.country_selection, nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus, name="application_status"), default=ApplicationStatus.draft, index=True, nullable=False)
    form_data: Mapped[dict | list] = mapped_column(JSONB, default=dict, nullable=False)
    face_score: Mapped[float | None] = mapped_column(Numeric(5, 4))
    passport_mrz_data: Mapped[dict | list] = mapped_column(JSONB, default=dict, nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
