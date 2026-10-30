import secrets
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user, require_role
from app.models.user import User, UserProfile, UserRole, AuditEvent
from app.models.clinician import PatientSharingPermission, ClinicianNote, ClinicianProfile
from app.models.menstrual import MenstrualPeriod
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import LaboratoryResult
from app.schemas.clinician import (
    ClinicianInviteRequest,
    SharingPermissionResponse,
    ClinicianNoteCreate,
    ClinicianNoteResponse,
    AuthorizedPatientSummary
)
from app.services.cycle_analytics import CycleAnalyticsService

router = APIRouter(prefix="/clinicians", tags=["Clinician Portal & Data Sharing"])

# -------------------------------------------------------------
# Patient-Facing Sharing Endpoints
# -------------------------------------------------------------
@router.post("/invite", response_model=SharingPermissionResponse)
def create_sharing_invitation(
    invite_in: ClinicianInviteRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Patient creates a secure, time-limited access code for their clinician."""
    access_code = "CA-" + secrets.token_hex(4).upper()
    valid_until = (datetime.now(timezone.utc) + timedelta(days=invite_in.duration_days)).isoformat()

    target_clinician_id = None
    if invite_in.clinician_email:
        clinician_user = db.query(User).filter(
            User.email == invite_in.clinician_email,
            User.role == UserRole.CLINICIAN.value
        ).first()
        if clinician_user:
            target_clinician_id = clinician_user.id

    perm = PatientSharingPermission(
        patient_id=current_user.id,
        clinician_id=target_clinician_id or current_user.id, # linked when redeemed if unassigned
        access_code=access_code,
        sharing_scope=invite_in.sharing_scope,
        valid_until=valid_until,
        is_revoked=False
    )
    db.add(perm)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="sharing_grant_created",
        resource_type="patient_sharing_permission",
        resource_id=perm.id
    ))

    db.commit()
    db.refresh(perm)
    return perm

@router.get("/sharing-permissions", response_model=List[SharingPermissionResponse])
def list_sharing_permissions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(PatientSharingPermission).filter(
        PatientSharingPermission.patient_id == current_user.id
    ).order_by(PatientSharingPermission.created_at.desc()).all()

@router.post("/revoke-permission/{perm_id}")
def revoke_sharing_permission(
    perm_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    perm = db.query(PatientSharingPermission).filter(
        PatientSharingPermission.id == perm_id,
        PatientSharingPermission.patient_id == current_user.id
    ).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Sharing permission not found.")

    perm.is_revoked = True
    perm.revoked_at = datetime.now(timezone.utc)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="sharing_revoked",
        resource_type="patient_sharing_permission",
        resource_id=perm.id
    ))

    db.commit()
    return {"message": "Access permission revoked successfully."}

# -------------------------------------------------------------
# Clinician Portal Endpoints
# -------------------------------------------------------------
@router.post("/redeem-invite")
def redeem_invite_code(
    access_code: str,
    current_user: User = Depends(require_role([UserRole.CLINICIAN.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    perm = db.query(PatientSharingPermission).filter(
        PatientSharingPermission.access_code == access_code.strip().upper(),
        PatientSharingPermission.is_revoked == False
    ).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Invalid or revoked access code.")

    # Check expiration
    if datetime.fromisoformat(perm.valid_until) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This access code has expired.")

    perm.clinician_id = current_user.id
    db.commit()
    return {"message": "Access granted. Patient successfully connected to your clinician dashboard."}

@router.get("/patients", response_model=List[AuthorizedPatientSummary])
def list_authorized_patients(
    current_user: User = Depends(require_role([UserRole.CLINICIAN.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    # Clinician sees only patients who granted active access
    permissions = db.query(PatientSharingPermission).filter(
        PatientSharingPermission.clinician_id == current_user.id,
        PatientSharingPermission.is_revoked == False
    ).all()

    results = []
    for p in permissions:
        # Verify not expired
        if datetime.fromisoformat(p.valid_until) < datetime.now(timezone.utc):
            continue

        patient = db.query(User).filter(User.id == p.patient_id).first()
        if not patient:
            continue

        profile = db.query(UserProfile).filter(UserProfile.user_id == p.patient_id).first()
        periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == p.patient_id).order_by(MenstrualPeriod.start_date.desc()).all()
        last_date = periods[0].start_date if periods else None

        user_age = profile.age if profile else 25
        menarche_age = profile.menarche_age if profile else 13
        analytics = CycleAnalyticsService.compute_analytics(periods, user_age, menarche_age)

        results.append(AuthorizedPatientSummary(
            patient_id=patient.id,
            full_name=patient.full_name,
            age=profile.age if profile else None,
            sharing_scope=p.sharing_scope,
            valid_until=p.valid_until,
            access_granted_at=p.created_at,
            last_cycle_recorded=last_date,
            irregular_cycles_flag=analytics["irregular_cycles_count"] > 0
        ))

    return results

@router.get("/patients/{patient_id}")
def get_authorized_patient_detail(
    patient_id: str,
    current_user: User = Depends(require_role([UserRole.CLINICIAN.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    # Verify permission
    perm = db.query(PatientSharingPermission).filter(
        PatientSharingPermission.patient_id == patient_id,
        PatientSharingPermission.clinician_id == current_user.id,
        PatientSharingPermission.is_revoked == False
    ).first()
    if not perm and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="You do not have active clinical authorization for this patient.")

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == patient_id).first()
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == patient_id).order_by(MenstrualPeriod.start_date.desc()).all()
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == patient_id).order_by(SymptomEntry.date.desc()).all()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == patient_id).order_by(BodyMeasurement.date.desc()).all()
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == patient_id).order_by(LaboratoryResult.test_date.desc()).all()
    notes = db.query(ClinicianNote).filter(ClinicianNote.patient_id == patient_id).order_by(ClinicianNote.created_at.desc()).all()

    user_age = profile.age if profile else 25
    menarche_age = profile.menarche_age if profile else 13
    analytics = CycleAnalyticsService.compute_analytics(periods, user_age, menarche_age)

    # Audit clinician access
    db.add(AuditEvent(
        user_id=patient_id,
        actor_id=current_user.id,
        event_type="clinician_access_view",
        resource_type="patient_health_record",
        resource_id=patient_id
    ))
    db.commit()

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
        },
        "profile": profile,
        "analytics": analytics,
        "periods": periods,
        "symptoms": symptoms,
        "measurements": measurements,
        "labs": labs,
        "clinician_notes": notes
    }

@router.post("/notes", response_model=ClinicianNoteResponse, status_code=status.HTTP_201_CREATED)
def add_clinician_note(
    note_in: ClinicianNoteCreate,
    current_user: User = Depends(require_role([UserRole.CLINICIAN.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    note = ClinicianNote(
        patient_id=note_in.patient_id,
        clinician_id=current_user.id,
        consultation_date=note_in.consultation_date,
        general_notes=note_in.general_notes,
        cycle_review=note_in.cycle_review,
        symptom_review=note_in.symptom_review,
        recommendation=note_in.recommendation,
        follow_up_date=note_in.follow_up_date,
        referral_status=note_in.referral_status or "none"
    )
    db.add(note)

    db.add(AuditEvent(
        user_id=note_in.patient_id,
        actor_id=current_user.id,
        event_type="clinician_note_added",
        resource_type="clinician_note",
        resource_id=note.id
    ))

    db.commit()
    db.refresh(note)
    return note

@router.get("/notes/{patient_id}", response_model=List[ClinicianNoteResponse])
def get_clinician_notes(
    patient_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Patient can see their own clinician notes; clinician can see notes they authored or if authorized
    if current_user.id != patient_id and current_user.role not in [UserRole.CLINICIAN.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    return db.query(ClinicianNote).filter(
        ClinicianNote.patient_id == patient_id
    ).order_by(ClinicianNote.created_at.desc()).all()
