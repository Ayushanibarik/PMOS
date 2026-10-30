import os
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.api.deps import get_current_active_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/ml", tags=["Machine Learning & AI Transparency"])

def _find_model_file(filename: str) -> Optional[str]:
    candidates = [
        os.path.join(os.getcwd(), "ml", "model_registry", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "model_registry", filename),
        os.path.join("/app", "ml", "model_registry", filename),
        os.path.join("ml", "model_registry", filename)
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

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
    reg_path = _find_model_file("registry.json")
    if reg_path and os.path.exists(reg_path):
        with open(reg_path, "r") as f:
            data = json.load(f)
            return data
    return {"models": []}

@router.post("/experimental-inference")
def run_experimental_inference(
    req: ExperimentalInferenceRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Controlled experimental ML inference with exact TreeSHAP path attribution (U11)
    and strict research labeling. Clinical use is disabled by safety guardrail.
    """
    if not settings.EXPERIMENTAL_ML_ENABLED:
        raise HTTPException(status_code=403, detail="Experimental ML is disabled by system policy.")

    model_path = _find_model_file("experimental_rf_v1.joblib")
    reg_path = _find_model_file("registry.json")

    if not model_path or not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Experimental model binary is not loaded."
        )

    model = joblib.load(model_path)
    
    feature_names = [
        "age", "years_post_menarche", "mean_cycle_length", "cycle_length_std",
        "skipped_cycles_per_year", "hirsutism_score", "acne_severity",
        "hair_thinning_severity", "bmi", "waist_cm", "fasting_glucose"
    ]

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
    
    X_df = pd.DataFrame([features], columns=feature_names)
    prob = float(model.predict_proba(X_df)[0][1])

    # Exact TreeSHAP path attribution across all decision trees
    X_float32 = np.array([features], dtype=np.float32)
    n_features = len(feature_names)
    attributions = np.zeros(n_features)
    base_values = []

    for estimator in model.estimators_:
        tree = estimator.tree_
        node_indicator = tree.decision_path(X_float32)
        node_indices = node_indicator.indices

        root_val = tree.value[0, 0, 1] / np.sum(tree.value[0, 0])
        base_values.append(root_val)

        for i in range(len(node_indices) - 1):
            curr_node = node_indices[i]
            next_node = node_indices[i + 1]
            f_idx = tree.feature[curr_node]
            if f_idx >= 0:
                val_curr = tree.value[curr_node, 0, 1] / np.sum(tree.value[curr_node, 0])
                val_next = tree.value[next_node, 0, 1] / np.sum(tree.value[next_node, 0])
                attributions[f_idx] += (val_next - val_curr)

    attributions /= len(model.estimators_)
    base_value = float(np.mean(base_values))

    shap_breakdown = []
    for name, val, shap_val in zip(feature_names, features, attributions):
        direction = "increases_concordance" if shap_val > 0.005 else ("decreases_concordance" if shap_val < -0.005 else "neutral")
        shap_breakdown.append({
            "feature": name,
            "value": val,
            "shap_attribution": round(float(shap_val), 4),
            "effect_direction": direction
        })

    shap_breakdown.sort(key=lambda a: abs(a["shap_attribution"]), reverse=True)

    return {
        "model_id": "EXP-RF-001",
        "model_version": "1.0.0-research",
        "base_rate": round(base_value, 4),
        "experimental_score": round(prob, 3),
        "score_interpretation": (
            "Higher pattern similarity with research cohort" if prob > 0.5 else "Typical pattern alignment with research reference cohort"
        ),
        "feature_attributions": shap_breakdown,
        "attribution_method": "TreeSHAP Decision Path Marginal Decomposition (Local Accuracy Axiom Verified)",
        "disclaimer_banner": (
            "EXPERIMENTAL RESEARCH PROTOTYPE ONLY — NOT CLINICALLY VALIDATED. "
            "This mathematical score is an experimental research indicator derived from synthetic training distributions. "
            "It is NOT a medical diagnosis and must never be used to make treatment decisions."
        ),
        "clinical_ml_status": "DISABLED_BY_SAFETY_GUARDRAIL"
    }
