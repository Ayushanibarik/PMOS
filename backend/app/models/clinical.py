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

class ClinicalConsultationOutcome(Base):
    __tablename__ = "clinical_consultation_outcomes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consultation_date = Column(String(10), nullable=False, index=True)
    clinician_name_or_id = Column(String(255), nullable=False)
    diagnosis_status = Column(String(50), nullable=False) # confirmed_pcos, pcos_ruled_out, differential_identified, normal_ovulation, inconclusive
    differential_diagnosis = Column(String(100), nullable=True) # hypothyroidism, hyperprolactinemia, ncah, fha, normal_variation, other
    prescribed_investigations = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    
    # Bayesian Recalibration Tracking
    prior_alignment_score = Column(Float, nullable=True)
    posterior_alignment_score = Column(Float, nullable=True)
    likelihood_ratio = Column(Float, default=1.0, nullable=False)
    is_recalibrated = Column(Boolean, default=False, nullable=False)
    rollback_available = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class LaboratoryScheduleReminder(Base):
    __tablename__ = "laboratory_schedule_reminders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(100), nullable=False)
    test_category = Column(String(50), nullable=False) # follicular_day_2_to_4, mid_luteal_progesterone, fasting_morning, differential_exclusion, pelvic_ultrasound
    recommended_timing = Column(String(255), nullable=False)
    due_date_start = Column(String(10), nullable=True)
    due_date_end = Column(String(10), nullable=True)
    clinical_rationale = Column(Text, nullable=False)
    preparation_instructions = Column(Text, nullable=False)
    imaging_guidance = Column(Text, nullable=True) # Non-invasive TAS guidance, TVS consent context (no marital bias)
    status = Column(String(30), default="pending", nullable=False) # pending, completed, skipped

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class AshaCampIntake(Base):
    __tablename__ = "asha_camp_intakes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asha_worker_id = Column(String(36), nullable=False, index=True)
    camp_location = Column(String(255), nullable=False)
    camp_date = Column(String(10), nullable=False, index=True)
    anonymous_patient_token = Column(String(64), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    menarche_age = Column(Integer, nullable=True)
    cycle_regularity = Column(String(50), nullable=False) # regular, irregular, absent
    symptoms_summary_json = Column(Text, nullable=False) # JSON list of reported indicators
    asian_indian_risk_flag = Column(Boolean, default=False, nullable=False)
    triage_recommendation = Column(String(100), nullable=False)
    sync_status = Column(String(30), default="synced", nullable=False) # synced, pending

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
