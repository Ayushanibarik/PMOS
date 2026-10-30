import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from app.db.session import Base

class PatternObservation(Base):
    __tablename__ = "pattern_observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(50), nullable=False, index=True) # cycle_regularity, hyperandrogenism_signs, metabolic_markers, data_sufficiency, adolescent_guidance
    observation_type = Column(String(50), nullable=False) # pattern_observation, follow_up_observation, data_insufficiency, no_notable_change
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence_details = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    rule_version = Column(String(50), default="2023_international_guideline_v1.0", nullable=False)
    trigger_data_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
