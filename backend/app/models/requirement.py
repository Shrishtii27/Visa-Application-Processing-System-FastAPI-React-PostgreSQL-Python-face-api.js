import uuid
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.enums import DocumentType

class VisaRequirement(Base):
    __tablename__ = 'visa_requirements'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    visa_type_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('visa_types.id', ondelete='CASCADE'), index=True, nullable=False)
    applicant_nationality: Mapped[str] = mapped_column(String(3), index=True, nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType, name="document_type"), nullable=False)
    document_label: Mapped[str] = mapped_column(String(255), nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_age_days: Mapped[int | None] = mapped_column(Integer)
    min_validity_days: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
