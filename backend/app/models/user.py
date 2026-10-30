import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    CLINICIAN = "clinician"
    ADMIN = "admin"
    RESEARCHER = "researcher"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.PATIENT.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)  # Auto-verified in local dev
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consents = relationship("UserConsent", back_populates="user", cascade="all, delete-orphan")
    clinician_profile = relationship("ClinicianProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Demographics & Menarche Context
    age = Column(Integer, nullable=True)
    menarche_age = Column(Integer, nullable=True)  # Age of first period (Crucial for 2023 international guidelines)
    country = Column(String(100), default="India", nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata", nullable=False)
    is_under_18 = Column(Boolean, default=False, nullable=False)

    # Menstrual Baseline
    cycle_regularity_self_report = Column(String(50), nullable=True)  # regular, irregular, uncertain
    typical_cycle_length = Column(Integer, nullable=True)  # e.g., 28
    typical_bleeding_duration = Column(Integer, nullable=True)  # e.g., 5
    last_period_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    experiences_skipped_periods = Column(Boolean, default=False, nullable=False)

    # Health & Reproductive Context (Optional)
    has_prior_pcos_diagnosis = Column(Boolean, default=False, nullable=False)
    has_other_endocrine_condition = Column(Boolean, default=False, nullable=False)
    using_hormonal_contraception = Column(Boolean, default=False, nullable=False)
    is_pregnant_postpartum = Column(Boolean, default=False, nullable=False)
    is_breastfeeding = Column(Boolean, default=False, nullable=False)
    medications_influencing_cycle = Column(String(255), nullable=True)

    onboarding_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="profile")

class UserConsent(Base):
    __tablename__ = "user_consents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(50), nullable=False)  # service_delivery, research, analytics, clinician_sharing, reminders
    is_granted = Column(Boolean, default=False, nullable=False)
    consent_version = Column(String(20), default="1.0", nullable=False)
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="consents")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    actor_id = Column(String(36), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # login, data_access, data_export, account_deletion, sharing_grant, sharing_revoke
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(36), nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
