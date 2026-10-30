from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MeasurementCreate(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sleep_hours: Optional[float] = None
    physical_activity_mins: Optional[int] = None
    data_source: str = "self_reported"
    notes: Optional[str] = None

class MeasurementResponse(BaseModel):
    id: str
    user_id: str
    date: str
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    bmi: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sleep_hours: Optional[float] = None
    physical_activity_mins: Optional[int] = None
    data_source: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
