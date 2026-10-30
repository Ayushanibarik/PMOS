import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class ClinicianProfile(Base):
    __tablename__ = "clinician_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    medical_license_number = Column(String(100), nullable=False)
    specialization = Column(String(100), default="Gynecology & Obstetrics", nullable=False)
    hospital_or_clinic = Column(String(255), nullable=False)
    verification_status = Column(String(20), default="verified", nullable=False) # pending, verified, rejected
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)

    user = relationship("User", back_populates="clinician_profile")

class PatientSharingPermission(Base):
    __tablename__ = "patient_sharing_permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    clinician_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    access_code = Column(String(50), nullable=False, index=True)
    sharing_scope = Column(String(50), default="full", nullable=False) # full, cycles_only, labs_only, summary_only
    valid_until = Column(String(20), nullable=False) # ISO datetime or date
    is_revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class ClinicianNote(Base):
    __tablename__ = "clinician_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    clinician_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    consultation_date = Column(String(10), nullable=False)
    general_notes = Column(Text, nullable=False)
    cycle_review = Column(Text, nullable=True)
    symptom_review = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=False)
    follow_up_date = Column(String(10), nullable=True)
    referral_status = Column(String(50), default="none", nullable=True) # none, endocrinology, pelvic_ultrasound, metabolic_panel

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

