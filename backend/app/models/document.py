import uuid
from datetime import datetime, date
from sqlalchemy import String, Integer, Text, Boolean, Date, Numeric, DateTime, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.enums import DocumentType, DocumentStatus

class UploadedDocument(Base):
    __tablename__ = 'uploaded_documents'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('applications.id', ondelete='CASCADE'), index=True, nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType, name="document_type"), index=True, nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str | None] = mapped_column(String(255))
    file_size_kb: Mapped[int | None] = mapped_column(Integer)
    mime_type: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus, name="document_status"), default=DocumentStatus.pending, nullable=False)
    ocr_confidence: Mapped[float | None] = mapped_column(Numeric(5, 4))
    validation_notes: Mapped[str | None] = mapped_column(Text)
    extracted_data: Mapped[dict | list] = mapped_column(JSONB, default=dict, nullable=False)
    is_bank_statement: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bank_statement_from_date: Mapped[date | None] = mapped_column(Date)
    bank_statement_to_date: Mapped[date | None] = mapped_column(Date)
    bank_statement_min_balance: Mapped[float | None] = mapped_column(Numeric(15, 2))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
