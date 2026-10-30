from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PatternObservationResponse(BaseModel):
    id: str
    user_id: str
    category: str # cycle_regularity, hyperandrogenism_signs, metabolic_markers, data_sufficiency, adolescent_guidance
    observation_type: str # pattern_observation, follow_up_observation, data_insufficiency, no_notable_change
    title: str
    description: str
    evidence_details: str
    recommendation: str
    rule_version: str
    created_at: datetime

    class Config:
        from_attributes = True

class ObservationSummaryResponse(BaseModel):
    total_observations: int
    has_irregular_cycles: bool
    has_hyperandrogenism_signs: bool
    has_metabolic_markers: bool
    guideline_citation: str
    disclaimer: str
    observations: List[PatternObservationResponse]
