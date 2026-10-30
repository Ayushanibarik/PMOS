from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile, UserConsent, AuditEvent
from app.models.menstrual import MenstrualPeriod
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import LaboratoryResult
from app.models.clinician import ClinicianNote
from app.schemas.user import UserProfileUpdate, UserProfileResponse, ConsentUpdateRequest, ConsentResponseItem

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/me", response_model=UserProfileResponse)
def get_patient_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.patch("/me", response_model=UserProfileResponse)
def update_patient_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    
    # If age is updated, automatically check is_under_18
    if "age" in update_data and update_data["age"] is not None:
        update_data["is_under_18"] = (update_data["age"] < 18)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="profile_update",
        resource_type="user_profile",
        resource_id=profile.id
    ))

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me/consents", response_model=List[ConsentResponseItem])
def get_patient_consents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()

@router.post("/me/consents", response_model=List[ConsentResponseItem])
def update_patient_consents(
    consent_in: ConsentUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    for item in consent_in.consents:
        consent = db.query(UserConsent).filter(
            UserConsent.user_id == current_user.id,
            UserConsent.consent_type == item.consent_type
        ).first()

        if consent:
            consent.is_granted = item.is_granted
            if not item.is_granted:
                consent.revoked_at = datetime.now(timezone.utc)
            else:
                consent.granted_at = datetime.now(timezone.utc)
                consent.revoked_at = None
        else:
            consent = UserConsent(
                user_id=current_user.id,
                consent_type=item.consent_type,
                is_granted=item.is_granted,
                consent_version="1.0"
            )
            db.add(consent)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="consent_update",
        resource_type="user_consent",
        resource_id=current_user.id
    ))

    db.commit()
    return db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()

@router.get("/me/timeline")
def get_unified_timeline(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unified chronological timeline bringing together periods, symptoms, measurements, and clinical records."""
    timeline: List[Dict[str, Any]] = []

    # 1. Periods
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == current_user.id).all()
    for p in periods:
        timeline.append({
            "id": p.id,
            "date": p.start_date,
            "type": "period",
            "title": f"Menstrual Period ({p.flow_intensity.replace('_', ' ').title()})",
            "summary": f"Bleeding started on {p.start_date}" + (f" through {p.end_date}" if p.end_date else ""),
            "metadata": {
                "flow_intensity": p.flow_intensity,
                "has_spotting": p.has_spotting,
                "notes": p.notes
            }
        })

    # 2. Symptoms
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == current_user.id).all()
    for s in symptoms:
        timeline.append({
            "id": s.id,
            "date": s.date,
            "type": "symptom",
            "title": f"Symptom: {s.symptom_name}",
            "summary": f"Severity {s.severity}/5 ({s.category.title()})",
            "metadata": {
                "category": s.category,
                "severity": s.severity,
                "notes": s.notes
            }
        })

    # 3. Measurements
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    for m in measurements:
        details = []
        if m.weight_kg:
            details.append(f"Weight: {m.weight_kg}kg")
        if m.bmi:
            details.append(f"BMI: {m.bmi}")
        if m.waist_cm:
            details.append(f"Waist: {m.waist_cm}cm")
        if m.sleep_hours:
            details.append(f"Sleep: {m.sleep_hours}h")

        timeline.append({
            "id": m.id,
            "date": m.date,
            "type": "measurement",
            "title": "Health Measurements",
            "summary": ", ".join(details) if details else "Measurements recorded",
            "metadata": {
                "weight_kg": m.weight_kg,
                "bmi": m.bmi,
                "waist_cm": m.waist_cm,
                "sleep_hours": m.sleep_hours,
                "data_source": m.data_source
            }
        })

    # 4. Lab Results
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == current_user.id).all()
    for l in labs:
        timeline.append({
            "id": l.id,
            "date": l.test_date,
            "type": "lab_result",
            "title": f"Laboratory Test: {l.test_name}",
            "summary": f"{l.value} {l.unit}" + (f" (Ref: {l.reference_range})" if l.reference_range else ""),
            "metadata": {
                "test_name": l.test_name,
                "value": l.value,
                "unit": l.unit,
                "reference_range": l.reference_range,
                "laboratory_name": l.laboratory_name
            }
        })

    # 5. Clinician Notes
    notes = db.query(ClinicianNote).filter(ClinicianNote.patient_id == current_user.id).all()
    for n in notes:
        timeline.append({
            "id": n.id,
            "date": n.consultation_date,
            "type": "clinician_note",
            "title": "Clinician Consultation Note",
            "summary": f"Recommendation: {n.recommendation[:80]}...",
            "metadata": {
                "recommendation": n.recommendation,
                "general_notes": n.general_notes,
                "referral_status": n.referral_status
            }
        })

    # Sort descending by date
    timeline.sort(key=lambda item: item["date"], reverse=True)
    return timeline
