import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from app.db.session import Base

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    resting_heart_rate = Column(Integer, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    physical_activity_mins = Column(Integer, nullable=True)
    data_source = Column(String(50), default="self_reported", nullable=False) # self_reported, device_synced, clinician_entered
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
