from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserProfile
from app.models.menstrual import MenstrualPeriod
from app.models.symptom import SymptomEntry
from app.models.measurement import BodyMeasurement
from app.models.clinical import LaboratoryResult
from app.schemas.observation import ObservationSummaryResponse, PatternObservationResponse
from app.clinical_rules.engine import ClinicalRuleEngine
from app.services.cycle_analytics import CycleAnalyticsService

router = APIRouter(prefix="/observations", tags=["Clinical Observations"])

@router.get("", response_model=ObservationSummaryResponse)
def get_clinical_observations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    periods = db.query(MenstrualPeriod).filter(MenstrualPeriod.user_id == current_user.id).all()
    symptoms = db.query(SymptomEntry).filter(SymptomEntry.user_id == current_user.id).all()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    labs = db.query(LaboratoryResult).filter(LaboratoryResult.user_id == current_user.id).all()

    # Calculate summaries
    user_age = profile.age if profile else 25
    menarche_age = profile.menarche_age if profile else 13
    summaries = CycleAnalyticsService.calculate_cycle_summaries(periods, user_age, menarche_age)

    # Format inputs for rule engine
    cycles_data = summaries
    symptoms_data = [
        {"symptom_code": s.symptom_code, "symptom_name": s.symptom_name, "category": s.category, "severity": s.severity, "date": s.date}
        for s in symptoms
    ]
    measurements_data = [
        {"weight_kg": m.weight_kg, "height_cm": m.height_cm, "bmi": m.bmi, "waist_cm": m.waist_cm, "date": m.date}
        for m in measurements
    ]
    labs_data = [
        {"test_name": l.test_name, "value": l.value, "unit": l.unit, "test_date": l.test_date}
        for l in labs
    ]

    obs_list = ClinicalRuleEngine.evaluate(
        user_profile=profile,
        cycles=cycles_data,
        symptoms=symptoms_data,
        measurements=measurements_data,
        lab_results=labs_data
    )

    has_irregular = any(obs.category == "cycle_regularity" and obs.observation_type == "follow_up_observation" for obs in obs_list)
    has_hyper = any(obs.category == "hyperandrogenism_signs" for obs in obs_list)
    has_metabolic = any(obs.category == "metabolic_markers" for obs in obs_list)

    formatted_obs = [
        PatternObservationResponse(
            id=f"obs_{idx}",
            user_id=current_user.id,
            category=o.category,
            observation_type=o.observation_type,
            title=o.title,
            description=o.description,
            evidence_details=o.evidence_details,
            recommendation=o.recommendation,
            rule_version=ClinicalRuleEngine.GUIDELINE_VERSION,
            created_at=profile.created_at if profile else None
        )
        for idx, o in enumerate(obs_list)
    ]

    return ObservationSummaryResponse(
        total_observations=len(formatted_obs),
        has_irregular_cycles=has_irregular,
        has_hyperandrogenism_signs=has_hyper,
        has_metabolic_markers=has_metabolic,
        guideline_citation=ClinicalRuleEngine.GUIDELINE_CITATION,
        disclaimer=(
            "Pattern observations highlight statistical and clinical guideline correlations. "
            "They DO NOT represent a medical diagnosis. Always consult a healthcare professional."
        ),
        observations=formatted_obs
    )
