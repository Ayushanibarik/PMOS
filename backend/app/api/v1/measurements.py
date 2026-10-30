from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.measurement import BodyMeasurement
from app.schemas.measurement import MeasurementCreate, MeasurementResponse

router = APIRouter(prefix="/measurements", tags=["Measurements"])

class RppgBiomarkerSubmission(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    resting_heart_rate: int = Field(ge=40, le=220)
    rmssd_ms: float = Field(ge=5.0, le=300.0)
    signal_quality_sqi: float = Field(ge=0.0, le=1.0)
    duration_seconds: int = Field(default=30)
    notes: Optional[str] = None

@router.get("", response_model=List[MeasurementResponse])
def list_measurements(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.date.desc()).all()

@router.post("", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
def create_measurement(
    measurement_in: MeasurementCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    computed_bmi = None
    if measurement_in.weight_kg and measurement_in.height_cm and measurement_in.height_cm > 0:
        height_m = measurement_in.height_cm / 100.0
        computed_bmi = round(measurement_in.weight_kg / (height_m * height_m), 1)

    computed_whtr = None
    if measurement_in.waist_cm and measurement_in.height_cm and measurement_in.height_cm > 0:
        computed_whtr = round(measurement_in.waist_cm / measurement_in.height_cm, 2)

    asian_risk = None
    if computed_bmi is not None:
        if computed_bmi < 18.5:
            asian_risk = "underweight"
        elif computed_bmi < 23.0:
            asian_risk = "normal"
        elif computed_bmi < 27.5:
            asian_risk = "increased_risk"
        else:
            asian_risk = "high_risk"

    measurement = BodyMeasurement(
        user_id=current_user.id,
        date=measurement_in.date,
        weight_kg=measurement_in.weight_kg,
        height_cm=measurement_in.height_cm,
        waist_cm=measurement_in.waist_cm,
        neck_circumference_cm=measurement_in.neck_circumference_cm,
        waist_to_height_ratio=computed_whtr,
        asian_indian_risk_category=asian_risk,
        bmi=computed_bmi,
        resting_heart_rate=measurement_in.resting_heart_rate,
        systolic_bp=measurement_in.systolic_bp,
        diastolic_bp=measurement_in.diastolic_bp,
        sleep_hours=measurement_in.sleep_hours,
        physical_activity_mins=measurement_in.physical_activity_mins,
        postprandial_slump_score=measurement_in.postprandial_slump_score,
        rppg_hrv_rmssd=measurement_in.rppg_hrv_rmssd,
        rppg_signal_quality=measurement_in.rppg_signal_quality,
        vocal_f0_hz=measurement_in.vocal_f0_hz,
        vocal_jitter_pct=measurement_in.vocal_jitter_pct,
        cmi_score=measurement_in.cmi_score,
        data_source=measurement_in.data_source,
        notes=measurement_in.notes
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement

@router.post("/rppg-biomarker", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
def submit_rppg_biomarker(
    submission: RppgBiomarkerSubmission,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Ingests zero-hardware smartphone camera rPPG resting heart rate and RMSSD estimate.
    Enforces signal quality threshold (SQI >= 0.60).
    Privacy Guarantee: Only extracted telemetry is received; raw video frames never leave client.
    """
    if submission.signal_quality_sqi < 0.60:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Signal Quality Index ({round(submission.signal_quality_sqi, 2)}) fell below acceptable threshold (0.60). "
                "Movement artifacts or inadequate finger illumination detected. Please repeat measurement holding finger steady."
            )
        )

    measurement = BodyMeasurement(
        user_id=current_user.id,
        date=submission.date,
        resting_heart_rate=submission.resting_heart_rate,
        rppg_hrv_rmssd=submission.rmssd_ms,
        rppg_signal_quality=submission.signal_quality_sqi,
        data_source="smartphone_rppg_camera",
        notes=submission.notes or f"30s camera rPPG biometric estimate (SQI: {round(submission.signal_quality_sqi, 2)})"
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement

@router.delete("/{measurement_id}")
def delete_measurement(
    measurement_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    measurement = db.query(BodyMeasurement).filter(
        BodyMeasurement.id == measurement_id,
        BodyMeasurement.user_id == current_user.id
    ).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement entry not found.")
    db.delete(measurement)
    db.commit()
    return {"message": "Measurement entry deleted successfully."}
