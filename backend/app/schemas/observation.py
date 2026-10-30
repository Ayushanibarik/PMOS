from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class PatternObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category: str # cycle_regularity, hyperandrogenism_signs, metabolic_markers, data_sufficiency, adolescent_guidance, post_pill_transition, psychological_wellbeing
    observation_type: str # pattern_observation, follow_up_observation, data_insufficiency, no_notable_change
    title: str
    description: str
    evidence_details: str
    recommendation: str
    rule_version: str
    created_at: datetime

class PatternAlignmentAxisBreakdown(BaseModel):
    axis_name: str
    weight_pct: float
    raw_score: float
    weighted_contribution: float
    description: str

class PatternAlignmentIndexResponse(BaseModel):
    pai_score: float # 0 to 100
    alignment_level: str # Low, Moderate, Elevated Concordance
    axes: List[PatternAlignmentAxisBreakdown]
    confidence_level: str # insufficient_data, low, moderate, robust
    data_completeness_pct: float
    developmental_modifier: Optional[str] = None
    contraceptive_modifier: Optional[str] = None
    disclaimer: str

class ObservationSummaryResponse(BaseModel):
    total_observations: int
    has_irregular_cycles: bool
    has_hyperandrogenism_signs: bool
    has_metabolic_markers: bool
    pattern_alignment_index: Optional[PatternAlignmentIndexResponse] = None
    guideline_citation: str
    disclaimer: str
    observations: List[PatternObservationResponse]
