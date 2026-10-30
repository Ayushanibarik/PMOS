from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.measurement import BodyMeasurement
from app.schemas.measurement import MeasurementCreate, MeasurementResponse

router = APIRouter(prefix="/measurements", tags=["Measurements"])

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

    measurement = BodyMeasurement(
        user_id=current_user.id,
        date=measurement_in.date,
        weight_kg=measurement_in.weight_kg,
        height_cm=measurement_in.height_cm,
        waist_cm=measurement_in.waist_cm,
        bmi=computed_bmi,
        resting_heart_rate=measurement_in.resting_heart_rate,
        systolic_bp=measurement_in.systolic_bp,
        diastolic_bp=measurement_in.diastolic_bp,
        sleep_hours=measurement_in.sleep_hours,
        physical_activity_mins=measurement_in.physical_activity_mins,
        data_source=measurement_in.data_source,
        notes=measurement_in.notes
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
