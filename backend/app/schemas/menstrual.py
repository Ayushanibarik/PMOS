from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class MenstrualPeriodCreate(BaseModel):
    start_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$") # YYYY-MM-DD
    end_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    flow_intensity: str = "medium" # very_light, light, medium, heavy, very_heavy
    has_spotting: bool = False
    associated_symptoms: Optional[str] = None
    notes: Optional[str] = None

class MenstrualPeriodUpdate(BaseModel):
    start_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    flow_intensity: Optional[str] = None
    has_spotting: Optional[bool] = None
    associated_symptoms: Optional[str] = None
    notes: Optional[str] = None

class MenstrualPeriodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    start_date: str
    end_date: Optional[str] = None
    flow_intensity: str
    has_spotting: bool
    associated_symptoms: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CycleSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cycle_start_date: str
    cycle_end_date: str
    cycle_length_days: int
    bleeding_duration_days: Optional[int] = None
    is_irregular_by_guideline: bool
    beta_drift_slope: Optional[float] = None
    drift_confidence: Optional[str] = None
    calculated_at: datetime

class CyclePredictionResponse(BaseModel):
    predicted_start_date: Optional[str] = None
    window_start_date: Optional[str] = None
    window_end_date: Optional[str] = None
    confidence_level: str # low, medium, high, insufficient_data
    cycle_count_used: int
    method_used: str
    explanation: str

class PhaseCheckpointResponse(BaseModel):
    current_cycle_day: Optional[int] = None
    estimated_phase: str # menstrual_flow, mid_cycle, luteal_phase, follicular_interim, uncertain
    checkpoint_active: bool
    checkpoint_type: Optional[str] = None # menstrual_flow, mid_cycle, luteal_phase
    checkpoint_title: Optional[str] = None
    checkpoint_prompt: Optional[str] = None
    suggested_symptom_codes: List[str] = []
    can_skip: bool = True
    disclaimer: str

class CycleAnalyticsResponse(BaseModel):
    total_recorded_cycles: int
    average_cycle_length: Optional[float] = None
    median_cycle_length: Optional[float] = None
    min_cycle_length: Optional[int] = None
    max_cycle_length: Optional[int] = None
    cycle_length_variation_std: Optional[float] = None
    average_bleeding_duration: Optional[float] = None
    irregular_cycles_count: int
    has_sufficient_data: bool
    guideline_status: str
    beta_drift: Optional[Dict[str, Any]] = None
    cycle_history: List[Dict[str, Any]]
    prediction: CyclePredictionResponse
