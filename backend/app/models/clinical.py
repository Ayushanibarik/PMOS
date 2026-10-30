import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from app.db.session import Base

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    document_type = Column(String(50), default="lab_report", nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class LaboratoryResult(Base):
    __tablename__ = "laboratory_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="SET NULL"), nullable=True)

    test_name = Column(String(100), nullable=False, index=True) # Total Testosterone, Free Testosterone, AMH, LH, FSH, TSH, Fasting Glucose, HbA1c, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    test_date = Column(String(10), nullable=False, index=True)
    laboratory_name = Column(String(255), nullable=True)
    reference_range = Column(String(100), nullable=True)
    assay_details = Column(String(255), nullable=True)
    entry_source = Column(String(50), default="manual_entry", nullable=False) # manual_entry, ocr_extracted, clinician_entered
    clinician_reviewed = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
