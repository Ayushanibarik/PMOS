from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class MeasurementCreate(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    neck_circumference_cm: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sleep_hours: Optional[float] = None
    physical_activity_mins: Optional[int] = None
    postprandial_slump_score: Optional[int] = None # 0 to 5
    rppg_hrv_rmssd: Optional[float] = None
    rppg_signal_quality: Optional[float] = None
    vocal_f0_hz: Optional[float] = None
    vocal_jitter_pct: Optional[float] = None
    cmi_score: Optional[float] = None
    data_source: str = "self_reported"
    notes: Optional[str] = None

class MeasurementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    date: str
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    neck_circumference_cm: Optional[float] = None
    waist_to_height_ratio: Optional[float] = None
    asian_indian_risk_category: Optional[str] = None
    bmi: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sleep_hours: Optional[float] = None
    physical_activity_mins: Optional[int] = None
    postprandial_slump_score: Optional[int] = None
    rppg_hrv_rmssd: Optional[float] = None
    rppg_signal_quality: Optional[float] = None
    vocal_f0_hz: Optional[float] = None
    vocal_jitter_pct: Optional[float] = None
    cmi_score: Optional[float] = None
    data_source: str
    notes: Optional[str] = None
    created_at: datetime
