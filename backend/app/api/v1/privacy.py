from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile, UserConsent, AuditEvent
from app.models.menstrual import MenstrualPeriod, CycleSummary, CyclePrediction
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import LaboratoryResult, UploadedDocument
from app.models.clinician import PatientSharingPermission, ClinicianNote

router = APIRouter(prefix="/privacy", tags=["Privacy & Data Governance"])

@router.post("/export")
def export_user_data_json(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Full machine-readable data export under India DPDP Act 2023 & GDPR."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    consents = db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == current_user.id).all()
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == current_user.id).all()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == current_user.id).all()
    docs = db.query(UploadedDocument).filter(UploadedDocument.user_id == current_user.id).all()
    permissions = db.query(PatientSharingPermission).filter(PatientSharingPermission.patient_id == current_user.id).all()
    notes = db.query(ClinicianNote).filter(ClinicianNote.patient_id == current_user.id).all()

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="privacy_data_export_json",
        resource_type="full_user_account",
        resource_id=current_user.id
    ))
    db.commit()

    return {
        "metadata": {
            "platform": "CycleAware",
            "format": "JSON",
            "compliance": "India DPDP Act 2023 Right of Access & Data Portability",
            "exported_at": profile.updated_at.isoformat() if profile else None
        },
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat()
        },
        "profile": {
            "age": profile.age if profile else None,
            "menarche_age": profile.menarche_age if profile else None,
            "country": profile.country if profile else None,
            "preferred_language": profile.preferred_language if profile else None,
            "timezone": profile.timezone if profile else None,
            "onboarding_completed": profile.onboarding_completed if profile else False
        },
        "consents": [
            {"type": c.consent_type, "granted": c.is_granted, "version": c.consent_version, "granted_at": c.granted_at.isoformat(), "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None}
            for c in consents
        ],
        "menstrual_periods": [
            {"start_date": p.start_date, "end_date": p.end_date, "flow": p.flow_intensity, "spotting": p.has_spotting, "notes": p.notes}
            for p in periods
        ],
        "symptoms": [
            {"date": s.date, "code": s.symptom_code, "name": s.symptom_name, "category": s.category, "severity": s.severity, "notes": s.notes}
            for s in symptoms
        ],
        "measurements": [
            {"date": m.date, "weight_kg": m.weight_kg, "height_cm": m.height_cm, "bmi": m.bmi, "waist_cm": m.waist_cm, "resting_hr": m.resting_heart_rate, "sleep_hours": m.sleep_hours}
            for m in measurements
        ],
        "laboratory_results": [
            {"date": l.test_date, "name": l.test_name, "value": l.value, "unit": l.unit, "reference_range": l.reference_range, "lab": l.laboratory_name}
            for l in labs
        ],
        "sharing_history": [
            {"access_code": p.access_code, "scope": p.sharing_scope, "valid_until": p.valid_until, "revoked": p.is_revoked}
            for p in permissions
        ],
        "clinician_notes": [
            {"consultation_date": n.consultation_date, "general_notes": n.general_notes, "recommendation": n.recommendation}
            for n in notes
        ]
    }

@router.post("/delete-account")
def delete_account_workflow(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Full account deletion and erasure under India DPDP Act 2023 Right to Erasure."""
    user_id = current_user.id

    # Record deletion audit log before purging
    db.add(AuditEvent(
        user_id=None, # Anonymized
        actor_id=user_id,
        event_type="account_erasure_completed",
        resource_type="user",
        resource_id=user_id
    ))

    # Cascade deletes profile, consents, periods, symptoms, measurements, labs via ForeignKey CASCADE
    db.delete(current_user)
    db.commit()

    return {"message": "Account and all associated personal health data permanently deleted."}

@router.get("/audit-log")
def get_user_audit_log(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    events = db.query(AuditEvent).filter(
        (AuditEvent.user_id == current_user.id) | (AuditEvent.actor_id == current_user.id)
    ).order_by(AuditEvent.created_at.desc()).limit(50).all()

    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "resource_type": e.resource_type,
            "timestamp": e.created_at.isoformat()
        }
        for e in events
    ]
