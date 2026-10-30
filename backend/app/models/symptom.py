import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from app.db.session import Base

class SymptomCatalogue(Base):
    __tablename__ = "symptom_catalogue"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True) # menstrual, skin, hair, metabolic, wellbeing
    description = Column(String(255), nullable=True)

class SymptomEntry(Base):
    __tablename__ = "symptom_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptom_code = Column(String(50), nullable=False, index=True)
    symptom_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    severity = Column(Integer, default=1, nullable=False) # 0 to 5
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    phase_checkpoint = Column(String(50), nullable=True) # menstrual_flow, mid_cycle, luteal_phase, spontaneous
    grooming_modality = Column(String(50), nullable=True) # none, shaving, waxing, threading, laser, cream
    days_since_grooming = Column(Integer, nullable=True)
    rvi_score = Column(Float, nullable=True) # Regrowth Velocity Index
    craving_type = Column(String(50), nullable=True) # carbohydrate, sugar, salty, none
    voice_logged = Column(Boolean, default=False, nullable=False)
    vernacular_raw_text = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

