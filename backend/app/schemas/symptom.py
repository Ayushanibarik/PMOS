from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class SymptomCreate(BaseModel):
    symptom_code: str
    symptom_name: str
    category: str # menstrual, skin, hair, metabolic, wellbeing
    severity: int = Field(ge=0, le=5)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    phase_checkpoint: Optional[str] = None # menstrual_flow, mid_cycle, luteal_phase, spontaneous
    grooming_modality: Optional[str] = None # none, shaving, waxing, threading, laser, cream
    days_since_grooming: Optional[int] = None
    rvi_score: Optional[float] = None
    craving_type: Optional[str] = None # carbohydrate, sugar, salty, none
    voice_logged: bool = False
    vernacular_raw_text: Optional[str] = None
    notes: Optional[str] = None

class SymptomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    symptom_code: str
    symptom_name: str
    category: str
    severity: int
    date: str
    phase_checkpoint: Optional[str] = None
    grooming_modality: Optional[str] = None
    days_since_grooming: Optional[int] = None
    rvi_score: Optional[float] = None
    craving_type: Optional[str] = None
    voice_logged: bool = False
    vernacular_raw_text: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

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

class VernacularNlpRequest(BaseModel):
    text: str
    language: str = "hi" # hi, ta, en, auto

class ParsedClinicalConcept(BaseModel):
    symptom_code: str
    symptom_name: str
    category: str
    detected_severity: int
    confidence: float
    matched_phrase: str
    is_negated: bool = False

class VernacularNlpResponse(BaseModel):
    detected_language: str
    concepts: List[ParsedClinicalConcept]
    requires_user_confirmation: bool = True
    disclaimer: str

class RviCalculationRequest(BaseModel):
    observed_severity: int = Field(ge=1, le=5)
    grooming_modality: str # shaving, waxing, threading, laser, depilatory_cream, none
    days_since_grooming: int = Field(ge=0)
    ita_angle: Optional[float] = None # Individual Typology Angle in degrees

class RviCalculationResponse(BaseModel):
    rvi_score: float
    modality_coefficient: float
    growth_velocity_category: str # baseline, moderate, elevated
    ita_skin_tone_category: Optional[str] = None
    explanation: str
    disclaimer: str
