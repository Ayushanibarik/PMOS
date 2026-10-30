import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from app.db.session import Base

class MenstrualPeriod(Base):
    __tablename__ = "menstrual_periods"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    start_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    end_date = Column(String(10), nullable=True)                 # YYYY-MM-DD
    flow_intensity = Column(String(20), default="medium", nullable=False) # very_light, light, medium, heavy, very_heavy
    has_spotting = Column(Boolean, default=False, nullable=False)
    associated_symptoms = Column(Text, nullable=True)  # Comma-separated or JSON list
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class CycleSummary(Base):
    __tablename__ = "cycle_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    cycle_start_date = Column(String(10), nullable=False) # Period 1 start date
    cycle_end_date = Column(String(10), nullable=False)   # Period 2 start date - 1 day
    cycle_length_days = Column(Integer, nullable=False)
    bleeding_duration_days = Column(Integer, nullable=True)
    is_irregular_by_guideline = Column(Boolean, default=False, nullable=False)
    beta_drift_slope = Column(Float, nullable=True) # Longitudinal shift in days/cycle
    drift_confidence = Column(String(20), default="insufficient_data", nullable=True)
    
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class CyclePrediction(Base):
    __tablename__ = "cycle_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    predicted_start_date = Column(String(10), nullable=False)
    window_start_date = Column(String(10), nullable=False)
    window_end_date = Column(String(10), nullable=False)
    confidence_level = Column(String(20), default="medium", nullable=False) # low, medium, high, insufficient_data
    cycle_count_used = Column(Integer, default=0, nullable=False)
    method_used = Column(String(50), default="rolling_median_variance", nullable=False)
    
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

