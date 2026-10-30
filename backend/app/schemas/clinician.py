from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class ClinicianInviteRequest(BaseModel):
    clinician_email: Optional[str] = None
    sharing_scope: str = "full" # full, cycles_only, labs_only, summary_only
    duration_days: int = 30

class SharingPermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    clinician_id: Optional[str] = None
    access_code: str
    sharing_scope: str
    valid_until: str
    is_revoked: bool
    created_at: datetime

class ClinicianNoteCreate(BaseModel):
    patient_id: str
    consultation_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    general_notes: str
    cycle_review: Optional[str] = None
    symptom_review: Optional[str] = None
    recommendation: str
    follow_up_date: Optional[str] = None
    referral_status: Optional[str] = "none"

class ClinicianNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    clinician_id: str
    consultation_date: str
    general_notes: str
    cycle_review: Optional[str] = None
    symptom_review: Optional[str] = None
    recommendation: str
    follow_up_date: Optional[str] = None
    referral_status: Optional[str] = None
    created_at: datetime

class AuthorizedPatientSummary(BaseModel):
    patient_id: str
    full_name: str
    age: Optional[int] = None
    sharing_scope: str
    valid_until: str
    access_granted_at: datetime
    last_cycle_recorded: Optional[str] = None
    irregular_cycles_flag: bool = False
