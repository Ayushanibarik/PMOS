from pydantic import BaseModel, Field
from typing import Optional, List
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

    class Config:
        from_attributes = True

class CycleSummaryResponse(BaseModel):
    id: str
    cycle_start_date: str
    cycle_end_date: str
    cycle_length_days: int
    bleeding_duration_days: Optional[int] = None
    is_irregular_by_guideline: bool
    calculated_at: datetime

    class Config:
        from_attributes = True

class CyclePredictionResponse(BaseModel):
    predicted_start_date: Optional[str] = None
    window_start_date: Optional[str] = None
    window_end_date: Optional[str] = None
    confidence_level: str # low, medium, high, insufficient_data
    cycle_count_used: int
    method_used: str
    explanation: str

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
    cycle_history: List[CycleSummaryResponse]
    prediction: Optional[CyclePredictionResponse] = None
