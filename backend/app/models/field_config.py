import uuid
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class FormFieldConfig(Base):
    __tablename__ = 'form_field_config'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    visa_type_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('visa_types.id', ondelete='CASCADE'), index=True, nullable=False)
    applicant_nationality: Mapped[str] = mapped_column(String(3), default='ALL', nullable=False)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    field_label: Mapped[str] = mapped_column(String(200), nullable=False)
    field_type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    options: Mapped[dict | list] = mapped_column(JSONB, default=list, nullable=False)
    validation_regex: Mapped[str | None] = mapped_column(Text)
    placeholder: Mapped[str | None] = mapped_column(Text)
    help_text: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint('visa_type_id', 'applicant_nationality', 'field_name', name='unique_visa_field'),
    )
