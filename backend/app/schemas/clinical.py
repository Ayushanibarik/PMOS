from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class LaboratoryResultCreate(BaseModel):
    test_name: str
    value: float
    unit: str
    test_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    laboratory_name: Optional[str] = None
    reference_range: Optional[str] = None
    assay_details: Optional[str] = None
    notes: Optional[str] = None

class LaboratoryResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    document_id: Optional[str] = None
    test_name: str
    value: float
    unit: str
    test_date: str
    laboratory_name: Optional[str] = None
    reference_range: Optional[str] = None
    assay_details: Optional[str] = None
    entry_source: str
    clinician_reviewed: bool
    notes: Optional[str] = None
    created_at: datetime

class UploadedDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    original_filename: str
    file_size_bytes: int
    mime_type: str
    document_type: str
    created_at: datetime

class ConsultationOutcomeCreate(BaseModel):
    consultation_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    clinician_name_or_id: str
    diagnosis_status: str # confirmed_pcos, pcos_ruled_out, differential_identified, normal_ovulation, inconclusive
    differential_diagnosis: Optional[str] = None # hypothyroidism, hyperprolactinemia, ncah, fha, normal_variation, other
    prescribed_investigations: Optional[str] = None
    clinical_notes: Optional[str] = None

class ConsultationOutcomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    consultation_date: str
    clinician_name_or_id: str
    diagnosis_status: str
    differential_diagnosis: Optional[str] = None
    prescribed_investigations: Optional[str] = None
    clinical_notes: Optional[str] = None
    prior_alignment_score: Optional[float] = None
    posterior_alignment_score: Optional[float] = None
    likelihood_ratio: float
    is_recalibrated: bool
    rollback_available: bool
    created_at: datetime

class LaboratoryScheduleReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    test_name: str
    test_category: str
    recommended_timing: str
    due_date_start: Optional[str] = None
    due_date_end: Optional[str] = None
    clinical_rationale: str
    preparation_instructions: str
    imaging_guidance: Optional[str] = None
    status: str
    created_at: datetime

class AshaCampIntakeCreate(BaseModel):
    camp_location: str
    camp_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    age: int = Field(ge=10, le=65)
    menarche_age: Optional[int] = None
    cycle_regularity: str # regular, irregular, absent
    symptoms_reported: List[str] # list of symptom names / codes
    waist_cm: Optional[float] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class AshaCampIntakeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    asha_worker_id: str
    camp_location: str
    camp_date: str
    anonymous_patient_token: str
    age: int
    cycle_regularity: str
    asian_indian_risk_flag: bool
    triage_recommendation: str
    sync_status: str
    created_at: datetime
