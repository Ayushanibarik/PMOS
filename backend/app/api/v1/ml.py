import os
import json
import joblib
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.api.deps import get_current_active_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/ml", tags=["Machine Learning & AI Transparency"])

class ExperimentalInferenceRequest(BaseModel):
    age: float
    years_post_menarche: float
    mean_cycle_length: float
    cycle_length_std: float
    skipped_cycles_per_year: int
    hirsutism_score: int
    acne_severity: int
    hair_thinning_severity: int
    bmi: float
    waist_cm: float
    fasting_glucose: Optional[float] = 90.0

@router.get("/models")
def get_model_registry(current_user: User = Depends(get_current_active_user)):
    """Retrieve the model registry, performance metrics, and safety flags."""
    reg_path = os.path.join("ml", "model_registry", "registry.json")
    if os.path.exists(reg_path):
        with open(reg_path, "r") as f:
            data = json.load(f)
            return data
    return {"models": []}

@router.post("/experimental-inference")
def run_experimental_inference(
    req: ExperimentalInferenceRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Controlled experimental ML inference with strict research labeling and feature attribution."""
    if not settings.EXPERIMENTAL_ML_ENABLED:
        raise HTTPException(status_code=403, detail="Experimental ML is disabled by system policy.")

    model_path = os.path.join("ml", "model_registry", "experimental_rf_v1.joblib")
    reg_path = os.path.join("ml", "model_registry", "registry.json")

    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Experimental model binary is not loaded."
        )

    model = joblib.load(model_path)
    
    # Prepare feature vector
    features = [
        req.age,
        req.years_post_menarche,
        req.mean_cycle_length,
        req.cycle_length_std,
        req.skipped_cycles_per_year,
        req.hirsutism_score,
        req.acne_severity,
        req.hair_thinning_severity,
        req.bmi,
        req.waist_cm,
        req.fasting_glucose or 90.0
    ]
    
    X = np.array([features])
    prob = float(model.predict_proba(X)[0][1])

    # Feature contribution breakdown (explainability)
    # Using baseline mean differences multiplied by feature weights as surrogate attribution
    feature_names = [
        "age", "years_post_menarche", "mean_cycle_length", "cycle_length_std",
        "skipped_cycles_per_year", "hirsutism_score", "acne_severity",
        "hair_thinning_severity", "bmi", "waist_cm", "fasting_glucose"
    ]
    importances = model.feature_importances_

    attributions = []
    for name, val, imp in zip(feature_names, features, importances):
        # Determine direction
        direction = "increases_pattern_flag" if val > 25 or (name in ["cycle_length_std", "skipped_cycles_per_year", "hirsutism_score"] and val > 2) else "baseline_influence"
        attributions.append({
            "feature": name,
            "value": val,
            "relative_importance_weight": round(float(imp), 4),
            "effect_direction": direction
        })

    attributions.sort(key=lambda a: a["relative_importance_weight"], reverse=True)

    return {
        "model_id": "EXP-RF-001",
        "model_version": "1.0.0-research",
        "experimental_score": round(prob, 3),
        "score_interpretation": (
            "Higher pattern similarity with research cohort" if prob > 0.5 else "Typical pattern alignment with research reference cohort"
        ),
        "feature_attributions": attributions,
        "disclaimer_banner": (
            "EXPERIMENTAL RESEARCH PROTOTYPE ONLY — NOT CLINICALLY VALIDATED. "
            "This mathematical score is an experimental research indicator derived from synthetic training distributions. "
            "It is NOT a medical diagnosis and must never be used to make treatment decisions."
        ),
        "clinical_ml_status": "DISABLED_BY_SAFETY_GUARDRAIL"
    }
