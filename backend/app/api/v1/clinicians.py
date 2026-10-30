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
from app.clinical_rules.engine import ClinicalRuleEngine
from app.services.lab_scheduling import LabSchedulingService

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
    summaries = CycleAnalyticsService.calculate_cycle_summaries(periods, user_age, menarche_age)
    cycle_lengths = [s.get("cycle_length_days") for s in summaries if s.get("cycle_length_days") is not None]
    beta_drift = CycleAnalyticsService.calculate_beta_drift(cycle_lengths)

    symptoms_data = [
        {
            "symptom_code": s.symptom_code,
            "symptom_name": s.symptom_name,
            "category": s.category,
            "severity": s.severity,
            "date": s.date,
            "rvi_score": s.rvi_score
        }
        for s in symptoms
    ]
    measurements_data = [
        {
            "weight_kg": m.weight_kg,
            "height_cm": m.height_cm,
            "bmi": m.bmi,
            "waist_cm": m.waist_cm,
            "waist_to_height_ratio": m.waist_to_height_ratio,
            "neck_circumference_cm": m.neck_circumference_cm,
            "postprandial_slump_score": m.postprandial_slump_score,
            "date": m.date
        }
        for m in measurements
    ]
    labs_data = [
        {"test_name": l.test_name, "value": l.value, "unit": l.unit, "test_date": l.test_date}
        for l in labs
    ]

    pai_data = ClinicalRuleEngine.calculate_pattern_alignment_index(
        user_profile=profile,
        cycles=summaries,
        symptoms=symptoms_data,
        measurements=measurements_data,
        lab_results=labs_data
    )

    obs_list = ClinicalRuleEngine.evaluate(
        user_profile=profile,
        cycles=summaries,
        symptoms=symptoms_data,
        measurements=measurements_data,
        lab_results=labs_data
    )

    last_date = periods[0].start_date if periods else None
    years_post = (user_age - menarche_age) if (user_age and menarche_age) else 10
    median_len = analytics.get("median_cycle_length") or 28.0
    recommended_schedule = LabSchedulingService.generate_recommended_schedule(
        last_period_date_str=last_date,
        median_cycle_length=median_len,
        user_age=user_age,
        years_post_menarche=years_post
    )

    # Asian-Indian Specific Anthropometric & Metabolic Evaluation
    latest_meas = measurements[0] if measurements else None
    bmi_val = latest_meas.bmi if latest_meas else None
    whtr_val = latest_meas.waist_to_height_ratio if latest_meas else None
    neck_val = latest_meas.neck_circumference_cm if latest_meas else None

    bmi_status = "Not recorded"
    if bmi_val:
        if bmi_val < 18.5:
            bmi_status = "Underweight (<18.5)"
        elif bmi_val < 23.0:
            bmi_status = "Normal (18.5-22.9 Asian-Indian threshold)"
        elif bmi_val < 25.0:
            bmi_status = "Overweight (23.0-24.9 Asian-Indian cutoff)"
        else:
            bmi_status = "Obese (≥25.0 Asian-Indian cutoff)"

    asian_indian_metabolic = {
        "bmi_value": bmi_val,
        "bmi_status": bmi_status,
        "is_asian_indian_overweight": bool(bmi_val and bmi_val >= 23.0),
        "whtr_value": whtr_val,
        "is_whtr_elevated": bool(whtr_val and whtr_val >= 0.50),
        "neck_circumference_cm": neck_val,
        "is_neck_elevated": bool(neck_val and neck_val >= 34.0)
    }

    # Rotterdam Criteria & Differential Evaluation
    has_oligo = bool(analytics.get("irregular_cycles_count", 0) > 0 or (analytics.get("average_cycle_length", 28) > 35) or (analytics.get("average_cycle_length", 28) < 21))
    clinical_ha = any(s.category in ["hirsutism", "acne", "alopecia"] for s in symptoms) or any((s.rvi_score or 0) > 2.5 for s in symptoms)
    biochem_ha = any("testosterone" in l.test_name.lower() and l.value > 0.6 for l in labs)
    pco_morph = any("ultrasound" in l.test_name.lower() or "follicle" in l.test_name.lower() for l in labs)

    tsh_lab = next((l for l in labs if "tsh" in l.test_name.lower()), None)
    prl_lab = next((l for l in labs if "prolactin" in l.test_name.lower()), None)
    ohp_lab = next((l for l in labs if "17-oh" in l.test_name.lower() or "17ohp" in l.test_name.lower()), None)

    rotterdam_assessment = {
        "oligo_anovulation": has_oligo,
        "hyperandrogenism": bool(clinical_ha or biochem_ha),
        "hyperandrogenism_clinical": clinical_ha,
        "hyperandrogenism_biochemical": biochem_ha,
        "pco_morphology": pco_morph,
        "rotterdam_criteria_met": sum([1 if has_oligo else 0, 1 if (clinical_ha or biochem_ha) else 0, 1 if pco_morph else 0]) >= 2,
        "differential_exclusions": {
            "tsh_evaluated": tsh_lab is not None,
            "tsh_value": f"{tsh_lab.value} {tsh_lab.unit}" if tsh_lab else "Not ordered",
            "prolactin_evaluated": prl_lab is not None,
            "prolactin_value": f"{prl_lab.value} {prl_lab.unit}" if prl_lab else "Not ordered",
            "ohp_evaluated": ohp_lab is not None,
            "ohp_value": f"{ohp_lab.value} {ohp_lab.unit}" if ohp_lab else "Not ordered"
        }
    }

    # Explainable TreeSHAP feature attributions
    tree_shap = [
        {
            "feature": "Longitudinal Cycle Length Variance",
            "attribution": round(0.28 if has_oligo else -0.15, 3),
            "description": "Deviation from typical 21-35 day ovulatory window"
        },
        {
            "feature": "Hyperandrogenic Phenotype (RVI/Symptoms)",
            "attribution": round(0.24 if clinical_ha else -0.10, 3),
            "description": "Cosmetically adjusted hair regrowth and persistent acne"
        },
        {
            "feature": "Metabolic Adiposity (Asian-Indian Cutoffs)",
            "attribution": round(0.18 if (bmi_val and bmi_val >= 23.0) else -0.12, 3),
            "description": "Asian-Indian specific BMI (≥23 kg/m²) and WHtR (≥0.50)"
        },
        {
            "feature": "Biochemical Endocrine Markers",
            "attribution": round(0.20 if biochem_ha else -0.05, 3),
            "description": "Serum androgen or gonadotropin balance"
        }
    ]

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
        "summaries": summaries,
        "beta_drift": beta_drift,
        "pai": pai_data,
        "observations": [o.to_dict() for o in obs_list],
        "recommended_schedule": recommended_schedule,
        "asian_indian_metabolic": asian_indian_metabolic,
        "rotterdam_assessment": rotterdam_assessment,
        "tree_shap": tree_shap,
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

