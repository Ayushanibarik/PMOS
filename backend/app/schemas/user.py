from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    role: str = "patient" # patient, clinician, researcher, asha_worker
    country: Optional[str] = "India"
    preferred_language: Optional[str] = "en"
    age_confirmed: bool = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    onboarding_completed: bool

class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    menarche_age: Optional[int] = None
    country: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    is_under_18: Optional[bool] = None
    cycle_regularity_self_report: Optional[str] = None
    typical_cycle_length: Optional[int] = None
    typical_bleeding_duration: Optional[int] = None
    last_period_date: Optional[str] = None
    experiences_skipped_periods: Optional[bool] = None
    has_prior_pcos_diagnosis: Optional[bool] = None
    has_other_endocrine_condition: Optional[bool] = None
    using_hormonal_contraception: Optional[bool] = None
    contraceptive_type: Optional[str] = None
    contraceptive_name: Optional[str] = None
    contraceptive_start_date: Optional[str] = None
    contraceptive_discontinued_date: Optional[str] = None
    is_pregnant_postpartum: Optional[bool] = None
    is_breastfeeding: Optional[bool] = None
    medications_influencing_cycle: Optional[str] = None
    body_neutral_mode: Optional[bool] = None
    postprandial_fatigue_freq: Optional[str] = None
    preferred_dialect: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    age: Optional[int] = None
    menarche_age: Optional[int] = None
    country: str
    preferred_language: str
    timezone: str
    is_under_18: bool
    cycle_regularity_self_report: Optional[str] = None
    typical_cycle_length: Optional[int] = None
    typical_bleeding_duration: Optional[int] = None
    last_period_date: Optional[str] = None
    experiences_skipped_periods: bool
    has_prior_pcos_diagnosis: bool
    has_other_endocrine_condition: bool
    using_hormonal_contraception: bool
    contraceptive_type: Optional[str] = None
    contraceptive_name: Optional[str] = None
    contraceptive_start_date: Optional[str] = None
    contraceptive_discontinued_date: Optional[str] = None
    is_pregnant_postpartum: bool
    is_breastfeeding: bool
    medications_influencing_cycle: Optional[str] = None
    body_neutral_mode: bool = False
    postprandial_fatigue_freq: Optional[str] = None
    preferred_dialect: str = "en"
    onboarding_completed: bool

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    profile: Optional[UserProfileResponse] = None

class ConsentUpdateItem(BaseModel):
    consent_type: str
    is_granted: bool

class ConsentUpdateRequest(BaseModel):
    consents: List[ConsentUpdateItem]

class ConsentResponseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    consent_type: str
    is_granted: bool
    consent_version: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
