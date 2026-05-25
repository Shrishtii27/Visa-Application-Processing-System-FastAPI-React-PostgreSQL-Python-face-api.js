import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class ApplicationChecklist(Base):
    __tablename__ = 'application_checklists'

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('applications.id', ondelete='CASCADE'), index=True, nullable=False)
    requirement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('visa_requirements.id', ondelete='CASCADE'), nullable=False)
    document_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey('uploaded_documents.id', ondelete='SET NULL'))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    notes: Mapped[str | None] = mapped_column(Text)
