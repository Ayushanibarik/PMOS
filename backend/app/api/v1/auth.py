from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserProfile, UserRole, UserConsent, AuditEvent
from app.models.clinician import ClinicianProfile
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    role_val = user_in.role if user_in.role in [r.value for r in UserRole] else UserRole.PATIENT.value

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role_val,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    # Create profile
    profile = UserProfile(
        user_id=user.id,
        country=user_in.country or "India",
        preferred_language=user_in.preferred_language or "en",
        onboarding_completed=False
    )
    db.add(profile)

    # If clinician role, create clinician profile
    if role_val == UserRole.CLINICIAN.value:
        c_prof = ClinicianProfile(
            user_id=user.id,
            medical_license_number="LIC-PENDING-" + user.id[:8].upper(),
            specialization="Gynecology & Reproductive Health",
            hospital_or_clinic="General Healthcare Practice",
            verification_status="verified" # verified by default in dev
        )
        db.add(c_prof)

    # Initialize mandatory and optional consents
    for c_type, granted in [
        ("service_delivery", True),
        ("research_participation", False),
        ("product_analytics", True),
        ("clinician_sharing", False),
        ("reminders", True),
    ]:
        db.add(UserConsent(
            user_id=user.id,
            consent_type=c_type,
            is_granted=granted,
            consent_version="1.0"
        ))

    # Audit event
    db.add(AuditEvent(
        user_id=user.id,
        actor_id=user.id,
        event_type="user_registration",
        resource_type="user",
        resource_id=user.id
    ))

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        onboarding_completed=False
    )

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated."
        )

    # Audit event
    db.add(AuditEvent(
        user_id=user.id,
        actor_id=user.id,
        event_type="user_login",
        resource_type="user",
        resource_id=user.id
    ))
    db.commit()

    onboarding_done = user.profile.onboarding_completed if user.profile else False
    token = create_access_token(subject=user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        onboarding_completed=onboarding_done
    )

from app.api.deps import get_current_active_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}
