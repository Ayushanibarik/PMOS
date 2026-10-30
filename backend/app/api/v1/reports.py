from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile, AuditEvent
from app.models.menstrual import MenstrualPeriod
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import LaboratoryResult
from app.services.cycle_analytics import CycleAnalyticsService
from app.services.report_service import ReportService
from app.clinical_rules.engine import ClinicalRuleEngine

router = APIRouter(prefix="/reports", tags=["Reports & Data Portability"])

def build_patient_data_bundle(current_user: User, db: Session):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == current_user.id).all()
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == current_user.id).all()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == current_user.id).all()

    user_age = profile.age if profile else 25
    menarche_age = profile.menarche_age if profile else 13
    analytics = CycleAnalyticsService.compute_analytics(periods, user_age, menarche_age)

    # Observations & PAI
    summaries = analytics.get("cycle_history", [])
    symptoms_payload = [
        {"symptom_code": s.symptom_code, "symptom_name": s.symptom_name, "category": s.category, "severity": s.severity, "date": s.date, "rvi_score": s.rvi_score}
        for s in symptoms
    ]
    measurements_payload = [
        {
            "weight_kg": m.weight_kg,
            "height_cm": m.height_cm,
            "bmi": m.bmi,
            "waist_cm": m.waist_cm,
            "waist_to_height_ratio": m.waist_to_height_ratio,
            "neck_circumference_cm": m.neck_circumference_cm,
            "date": m.date
        }
        for m in measurements
    ]
    labs_payload = [
        {"test_name": l.test_name, "value": l.value, "unit": l.unit, "test_date": l.test_date}
        for l in labs
    ]

    obs_list = ClinicalRuleEngine.evaluate(
        user_profile=profile,
        cycles=summaries,
        symptoms=symptoms_payload,
        measurements=measurements_payload,
        lab_results=labs_payload
    )

    pai_data = ClinicalRuleEngine.calculate_pattern_alignment_index(
        user_profile=profile,
        cycles=summaries,
        symptoms=symptoms_payload,
        measurements=measurements_payload,
        lab_results=labs_payload
    )

    return {
        "profile": {
            "age": profile.age if profile else None,
            "menarche_age": profile.menarche_age if profile else None,
            "country": profile.country if profile else "India",
            "using_hormonal_contraception": profile.using_hormonal_contraception if profile else False
        },
        "periods": [
            {"start_date": p.start_date, "end_date": p.end_date, "flow_intensity": p.flow_intensity, "has_spotting": p.has_spotting, "associated_symptoms": p.associated_symptoms, "notes": p.notes}
            for p in periods
        ],
        "symptoms": [
            {"date": s.date, "category": s.category, "symptom_name": s.symptom_name, "severity": s.severity, "phase_checkpoint": s.phase_checkpoint, "grooming_modality": s.grooming_modality, "rvi_score": s.rvi_score, "notes": s.notes}
            for s in symptoms
        ],
        "measurements": [
            {
                "date": m.date,
                "weight_kg": m.weight_kg,
                "height_cm": m.height_cm,
                "bmi": m.bmi,
                "waist_cm": m.waist_cm,
                "waist_to_height_ratio": m.waist_to_height_ratio,
                "neck_circumference_cm": m.neck_circumference_cm,
                "resting_heart_rate": m.resting_heart_rate,
                "systolic_bp": m.systolic_bp,
                "diastolic_bp": m.diastolic_bp,
                "sleep_hours": m.sleep_hours
            }
            for m in measurements
        ],
        "lab_results": [
            {"test_date": l.test_date, "test_name": l.test_name, "value": l.value, "unit": l.unit, "reference_range": l.reference_range, "laboratory_name": l.laboratory_name}
            for l in labs
        ],
        "analytics": analytics,
        "pai": pai_data,
        "observations": [o.to_dict() for o in obs_list]
    }

@router.get("/export/csv")
def export_csv_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    bundle = build_patient_data_bundle(current_user, db)
    csv_content = ReportService.generate_csv_export(bundle)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="data_export_csv",
        resource_type="patient_health_record",
        resource_id=current_user.id
    ))
    db.commit()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=CycleAware_HealthData_{current_user.id[:8]}.csv"}
    )

@router.get("/download/pdf")
def download_pdf_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    bundle = build_patient_data_bundle(current_user, db)
    pdf_bytes = ReportService.generate_pdf_report(current_user.full_name, bundle)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="report_download_pdf",
        resource_type="patient_health_report",
        resource_id=current_user.id
    ))
    db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=CycleAware_Report_{current_user.id[:8]}.pdf"}
    )

