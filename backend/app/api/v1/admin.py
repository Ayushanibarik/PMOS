from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import require_role
from app.models.user import User, UserRole, UserProfile, AuditEvent
from app.models.clinician import ClinicianProfile
from app.models.menstrual import MenstrualPeriod
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Administration & Operations"])

@router.get("/system-health")
def get_system_health(
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    user_count = db.query(func.count(User.id)).scalar() or 0
    period_count = db.query(func.count(MenstrualPeriod.id)).scalar() or 0
    clinician_count = db.query(func.count(ClinicianProfile.id)).scalar() or 0

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "database": "connected",
        "primary_terminology": settings.PRIMARY_TERMINOLOGY,
        "clinical_ml_status": "disabled_by_safety_policy" if not settings.CLINICAL_ML_ENABLED else "enabled",
        "experimental_ml_status": "enabled_for_research" if settings.EXPERIMENTAL_ML_ENABLED else "disabled",
        "statistics": {
            "total_registered_users": user_count,
            "total_menstrual_records": period_count,
            "total_verified_clinicians": clinician_count
        }
    }

@router.get("/users")
def list_users(
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]

@router.get("/audit-events")
def list_audit_events(
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(100).all()
    return [
        {
            "id": e.id,
            "actor_id": e.actor_id,
            "user_id": e.user_id,
            "event_type": e.event_type,
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "timestamp": e.created_at.isoformat()
        }
        for e in events
    ]

