from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    role: str = "patient" # patient, clinician, researcher
    # Initial onboarding / demographic data (optional at registration)
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
    is_pregnant_postpartum: Optional[bool] = None
    is_breastfeeding: Optional[bool] = None
    medications_influencing_cycle: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class UserProfileResponse(BaseModel):
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
    is_pregnant_postpartum: bool
    is_breastfeeding: bool
    medications_influencing_cycle: Optional[str] = None
    onboarding_completed: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

class ConsentUpdateItem(BaseModel):
    consent_type: str
    is_granted: bool

class ConsentUpdateRequest(BaseModel):
    consents: List[ConsentUpdateItem]

class ConsentResponseItem(BaseModel):
    consent_type: str
    is_granted: bool
    consent_version: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True
