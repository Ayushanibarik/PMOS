from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile
from app.models.menstrual import MenstrualPeriod
from app.schemas.menstrual import (
    MenstrualPeriodCreate,
    MenstrualPeriodUpdate,
    MenstrualPeriodResponse,
    CycleAnalyticsResponse,
    PhaseCheckpointResponse
)
from app.services.cycle_analytics import CycleAnalyticsService

router = APIRouter(prefix="/cycles", tags=["Menstrual Cycles"])

@router.get("", response_model=List[MenstrualPeriodResponse])
def list_periods(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(MenstrualPeriod).filter(
        MenstrualPeriod.user_id == current_user.id
    ).order_by(MenstrualPeriod.start_date.desc()).all()

@router.post("", response_model=MenstrualPeriodResponse, status_code=status.HTTP_201_CREATED)
def create_period(
    period_in: MenstrualPeriodCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check for existing period on the same start date
    existing = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.user_id == current_user.id,
        MenstrualPeriod.start_date == period_in.start_date
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A period entry already exists for this start date."
        )

    period = MenstrualPeriod(
        user_id=current_user.id,
        start_date=period_in.start_date,
        end_date=period_in.end_date,
        flow_intensity=period_in.flow_intensity,
        has_spotting=period_in.has_spotting,
        associated_symptoms=period_in.associated_symptoms,
        notes=period_in.notes
    )
    db.add(period)

    # Update profile last_period_date if newer
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        if not profile.last_period_date or period_in.start_date > profile.last_period_date:
            profile.last_period_date = period_in.start_date

    db.commit()
    db.refresh(period)
    return period

@router.get("/current-checkpoint", response_model=PhaseCheckpointResponse)
def get_current_phase_checkpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    periods = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.user_id == current_user.id
    ).order_by(MenstrualPeriod.start_date.desc()).all()

    last_date = periods[0].start_date if periods else (profile.last_period_date if profile else None)
    
    analytics = CycleAnalyticsService.compute_analytics(periods, profile.age if profile else 25, profile.menarche_age if profile else 13)
    median_len = analytics.get("median_cycle_length") or (profile.typical_cycle_length if profile else 28) or 28

    return CycleAnalyticsService.get_phase_checkpoint(last_date, median_len)

@router.get("/analytics", response_model=CycleAnalyticsResponse)
def get_cycle_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    periods = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.user_id == current_user.id
    ).all()
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    user_age = profile.age if profile else 25
    menarche_age = profile.menarche_age if profile else 13

    return CycleAnalyticsService.compute_analytics(periods, user_age, menarche_age)

@router.get("/{period_id}", response_model=MenstrualPeriodResponse)
def get_period(
    period_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    period = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.id == period_id,
        MenstrualPeriod.user_id == current_user.id
    ).first()
    if not period:
        raise HTTPException(status_code=404, detail="Period entry not found.")
    return period

@router.patch("/{period_id}", response_model=MenstrualPeriodResponse)
def update_period(
    period_id: str,
    period_in: MenstrualPeriodUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    period = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.id == period_id,
        MenstrualPeriod.user_id == current_user.id
    ).first()
    if not period:
        raise HTTPException(status_code=404, detail="Period entry not found.")

    update_data = period_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(period, field, val)

    db.commit()
    db.refresh(period)
    return period

@router.delete("/{period_id}")
def delete_period(
    period_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    period = db.query(MenstrualPeriod).filter(
        MenstrualPeriod.id == period_id,
        MenstrualPeriod.user_id == current_user.id
    ).first()
    if not period:
        raise HTTPException(status_code=404, detail="Period entry not found.")

    db.delete(period)
    db.commit()
    return {"message": "Period entry deleted successfully."}

