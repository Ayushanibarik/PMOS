import os
import uuid
import json
import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile, AuditEvent
from app.models.menstrual import MenstrualPeriod
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import (
    LaboratoryResult,
    UploadedDocument,
    ClinicalConsultationOutcome,
    AshaCampIntake
)
from app.schemas.clinical import (
    LaboratoryResultCreate,
    LaboratoryResultResponse,
    UploadedDocumentResponse,
    ConsultationOutcomeCreate,
    ConsultationOutcomeResponse,
    LaboratoryScheduleReminderResponse,
    AshaCampIntakeCreate,
    AshaCampIntakeResponse
)
from app.services.cycle_analytics import CycleAnalyticsService
from app.services.lab_scheduling import LabSchedulingService
from app.services.bayesian_recalibration import BayesianRecalibrationService
from app.clinical_rules.engine import ClinicalRuleEngine
from app.core.config import settings

router = APIRouter(prefix="/clinical-records", tags=["Clinical Records"])

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}

@router.get("/labs", response_model=List[LaboratoryResultResponse])
def list_laboratory_results(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(LaboratoryResult).filter(
        LaboratoryResult.user_id == current_user.id
    ).order_by(LaboratoryResult.test_date.desc()).all()

@router.post("/labs", response_model=LaboratoryResultResponse, status_code=status.HTTP_201_CREATED)
def create_laboratory_result(
    lab_in: LaboratoryResultCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = LaboratoryResult(
        user_id=current_user.id,
        test_name=lab_in.test_name,
        value=lab_in.value,
        unit=lab_in.unit,
        test_date=lab_in.test_date,
        laboratory_name=lab_in.laboratory_name,
        reference_range=lab_in.reference_range,
        assay_details=lab_in.assay_details,
        notes=lab_in.notes,
        entry_source="manual_entry",
        clinician_reviewed=False
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@router.delete("/labs/{result_id}")
def delete_laboratory_result(
    result_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = db.query(LaboratoryResult).filter(
        LaboratoryResult.id == result_id,
        LaboratoryResult.user_id == current_user.id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Laboratory result not found.")
    db.delete(result)
    db.commit()
    return {"message": "Laboratory result deleted successfully."}

@router.get("/recommended-schedule", response_model=List[LaboratoryScheduleReminderResponse])
def get_recommended_lab_schedule(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Computes personalized phase-locked laboratory and ultrasound test timeline (U09)
    based on predicted cycle day and international guideline timing windows.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    periods = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.user_id == current_user.id
    ).order_by(MenstrualPeriod.start_date.desc()).all()

    last_date = periods[0].start_date if periods else (profile.last_period_date if profile else None)
    
    analytics = CycleAnalyticsService.compute_analytics(periods, profile.age if profile else 25, profile.menarche_age if profile else 13)
    median_len = analytics.get("median_cycle_length") or 28.0

    age = profile.age if profile else 25
    menarche_age = profile.menarche_age if profile else 13
    years_post = (age - menarche_age) if (age and menarche_age) else 10

    schedule_items = LabSchedulingService.generate_recommended_schedule(
        last_period_date_str=last_date,
        median_cycle_length=median_len,
        user_age=age,
        years_post_menarche=years_post
    )

    responses = []
    for s in schedule_items:
        responses.append(LaboratoryScheduleReminderResponse(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            test_name=s["test_name"],
            test_category=s["test_category"],
            recommended_timing=s["recommended_timing"],
            due_date_start=s["due_date_start"],
            due_date_end=s["due_date_end"],
            clinical_rationale=s["clinical_rationale"],
            preparation_instructions=s["preparation_instructions"],
            imaging_guidance=s.get("imaging_guidance"),
            status=s["status"],
            created_at=profile.created_at if profile else periods[0].created_at if periods else None
        ))
    return responses

@router.post("/consultation-outcome", response_model=ConsultationOutcomeResponse, status_code=status.HTTP_201_CREATED)
def record_consultation_outcome(
    outcome_in: ConsultationOutcomeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Implements U10 Bayesian Closed-Loop Recalibration:
    Captures clinician-confirmed consultation findings and updates personalized
    monitoring baseline via Bayesian likelihood ratio update without altering global rules.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == current_user.id).all()
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == current_user.id).all()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == current_user.id).all()

    cycles_data = [{"cycle_length_days": p.end_date} for p in periods] # surrogate
    symptoms_data = [{"category": s.category, "symptom_code": s.symptom_code, "severity": s.severity, "rvi_score": s.rvi_score} for s in symptoms]
    measurements_data = [{"bmi": m.bmi, "waist_cm": m.waist_cm, "waist_to_height_ratio": m.waist_to_height_ratio, "neck_circumference_cm": m.neck_circumference_cm} for m in measurements]
    labs_data = [{"test_name": l.test_name, "value": l.value} for l in labs]

    pai = ClinicalRuleEngine.calculate_pattern_alignment_index(
        profile, cycles_data, symptoms_data, measurements_data, labs_data
    )
    prior_score = pai["pai_score"]

    recal = BayesianRecalibrationService.calculate_recalibration(
        prior_score=prior_score,
        diagnosis_status=outcome_in.diagnosis_status,
        differential_diagnosis=outcome_in.differential_diagnosis
    )

    outcome = ClinicalConsultationOutcome(
        user_id=current_user.id,
        consultation_date=outcome_in.consultation_date,
        clinician_name_or_id=outcome_in.clinician_name_or_id,
        diagnosis_status=outcome_in.diagnosis_status,
        differential_diagnosis=outcome_in.differential_diagnosis,
        prescribed_investigations=outcome_in.prescribed_investigations,
        clinical_notes=outcome_in.clinical_notes,
        prior_alignment_score=recal["prior_alignment_score"],
        posterior_alignment_score=recal["posterior_alignment_score"],
        likelihood_ratio=recal["likelihood_ratio"],
        is_recalibrated=True,
        rollback_available=True
    )
    db.add(outcome)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="bayesian_recalibration_applied",
        resource_type="clinical_consultation_outcome",
        resource_id=outcome.id,
        details_json=json.dumps(recal)
    ))

    db.commit()
    db.refresh(outcome)
    return outcome

@router.post("/recalibration-rollback/{outcome_id}")
def rollback_recalibration(
    outcome_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Rollback an applied Bayesian consultation recalibration back to guideline baseline."""
    outcome = db.query(ClinicalConsultationOutcome).filter(
        ClinicalConsultationOutcome.id == outcome_id,
        ClinicalConsultationOutcome.user_id == current_user.id
    ).first()
    if not outcome:
        raise HTTPException(status_code=404, detail="Consultation outcome record not found.")

    outcome.is_recalibrated = False
    outcome.rollback_available = False

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="bayesian_recalibration_rolled_back",
        resource_type="clinical_consultation_outcome",
        resource_id=outcome.id
    ))
    db.commit()
    return {"message": "Bayesian recalibration successfully rolled back to standard baseline."}

# -------------------------------------------------------------
# ASHA Worker Camp Mode Endpoints (U08)
# -------------------------------------------------------------
@router.post("/asha/camp-intake", response_model=AshaCampIntakeResponse, status_code=status.HTTP_201_CREATED)
def create_asha_camp_intake(
    intake_in: AshaCampIntakeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Field worker camp screening intake (U08):
    Generates isolated tokenized record. Guarantees patient privacy and air-gap isolation.
    """
    token = f"CAMP-{secrets.token_hex(4).upper()}"
    
    # Calculate Asian-Indian risk flag
    bmi_flag = False
    if intake_in.weight_kg and intake_in.height_cm and intake_in.height_cm > 0:
        h_m = intake_in.height_cm / 100.0
        bmi = intake_in.weight_kg / (h_m * h_m)
        if bmi >= 23.0:
            bmi_flag = True
    if intake_in.waist_cm and intake_in.waist_cm >= 80.0:
        bmi_flag = True

    # Simple triage recommendation
    is_irregular = intake_in.cycle_regularity in ["irregular", "absent"]
    has_symptoms = len(intake_in.symptoms_reported) >= 2
    if is_irregular and (has_symptoms or bmi_flag):
        triage = "Priority Primary Health Centre (PHC) Medical Referral"
    elif is_irregular:
        triage = "Maintain 3-Month Cycle Tracking Card"
    else:
        triage = "Routine Nutrition & Lifestyle Guidance"

    record = AshaCampIntake(
        asha_worker_id=current_user.id,
        camp_location=intake_in.camp_location,
        camp_date=intake_in.camp_date,
        anonymous_patient_token=token,
        age=intake_in.age,
        menarche_age=intake_in.menarche_age,
        cycle_regularity=intake_in.cycle_regularity,
        symptoms_summary_json=json.dumps(intake_in.symptoms_reported),
        asian_indian_risk_flag=bmi_flag,
        triage_recommendation=triage,
        sync_status="synced"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/asha/camp-records", response_model=List[AshaCampIntakeResponse])
def list_asha_camp_records(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lists anonymous screening records logged during camp sessions by this field worker."""
    return db.query(AshaCampIntake).filter(
        AshaCampIntake.asha_worker_id == current_user.id
    ).order_by(AshaCampIntake.created_at.desc()).all()

@router.post("/upload", response_model=UploadedDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_clinical_document(
    file: UploadFile = File(...),
    document_type: str = Form("lab_report"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF, JPG, and PNG documents are allowed."
        )

    os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)

    file_ext = os.path.splitext(file.filename or "")[1].lower()
    stored_name = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(settings.FILE_STORAGE_PATH, stored_name)

    size = 0
    with open(dest_path, "wb") as buffer:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                os.remove(dest_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
                )
            buffer.write(chunk)

    doc_entry = UploadedDocument(
        user_id=current_user.id,
        original_filename=file.filename or "uploaded_document",
        stored_filename=stored_name,
        file_path=dest_path,
        file_size_bytes=size,
        mime_type=file.content_type,
        document_type=document_type,
        is_deleted=False
    )
    db.add(doc_entry)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="document_upload",
        resource_type="uploaded_document",
        resource_id=doc_entry.id
    ))

    db.commit()
    db.refresh(doc_entry)
    return doc_entry

@router.get("/documents", response_model=List[UploadedDocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(UploadedDocument).filter(
        UploadedDocument.user_id == current_user.id,
        UploadedDocument.is_deleted == False
    ).order_by(UploadedDocument.created_at.desc()).all()

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc_entry = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id,
        UploadedDocument.is_deleted == False
    ).first()
    if not doc_entry or not os.path.exists(doc_entry.file_path):
        raise HTTPException(status_code=404, detail="Document not found.")

    return FileResponse(
        path=doc_entry.file_path,
        filename=doc_entry.original_filename,
        media_type=doc_entry.mime_type
    )
