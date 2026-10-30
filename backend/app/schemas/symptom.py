from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SymptomCreate(BaseModel):
    symptom_code: str
    symptom_name: str
    category: str # menstrual, skin, hair, metabolic, wellbeing
    severity: int = Field(ge=0, le=5)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    notes: Optional[str] = None

class SymptomResponse(BaseModel):
    id: str
    user_id: str
    symptom_code: str
    symptom_name: str
    category: str
    severity: int
    date: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SymptomCatalogueItem(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None

class SymptomTrendItem(BaseModel):
    symptom_name: str
    category: str
    frequency_count: int
    average_severity: float
    max_severity: int
    recent_trend: str # increasing, stable, decreasing
