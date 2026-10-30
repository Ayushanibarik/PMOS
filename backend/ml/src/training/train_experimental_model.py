"""Experimental Model Training & Validation Pipeline

Evaluates baseline machine learning models on the research cohort.
Produces standardized metrics, calibration evaluation, feature importances,
and serializes to the Model Registry.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    brier_score_loss,
    confusion_matrix
)

FEATURES = [
    "age",
    "years_post_menarche",
    "mean_cycle_length",
    "cycle_length_std",
    "skipped_cycles_per_year",
    "hirsutism_score",
    "acne_severity",
    "hair_thinning_severity",
    "bmi",
    "waist_cm",
    "fasting_glucose"
]
TARGET = "synthetic_phenotype_flag"

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ml_root = os.path.abspath(os.path.join(base_dir, "..", ".."))
    dataset_path = os.path.join(ml_root, "datasets", "synthetic_pcos_pmos_research_dataset.csv")

    if not os.path.exists(dataset_path):
        from ml.datasets.generate_synthetic_research_data import generate_dataset
        generate_dataset()

    df = pd.read_csv(dataset_path)
    X = df[FEATURES]
    y = df[TARGET]

    # 5-fold cross validation
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    auc_scores = []
    acc_scores = []
    rec_scores = []
    spec_scores = []
    prec_scores = []
    f1_scores = []
    brier_scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        clf.fit(X_train, y_train)

        y_prob = clf.predict_proba(X_val)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)

        auc_scores.append(roc_auc_score(y_val, y_prob))
        acc_scores.append(accuracy_score(y_val, y_pred))
        rec_scores.append(recall_score(y_val, y_pred))
        prec_scores.append(precision_score(y_val, y_pred))
        f1_scores.append(f1_score(y_val, y_pred))
        brier_scores.append(brier_score_loss(y_val, y_prob))

        tn, fp, fn, tp = confusion_matrix(y_val, y_pred).ravel()
        spec_scores.append(tn / (tn + fp) if (tn + fp) > 0 else 0)

    # Train final full model
    final_model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    final_model.fit(X, y)

    # Calculate feature importances
    importances = dict(zip(FEATURES, [round(float(imp), 4) for imp in final_model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

    registry_dir = os.path.join(ml_root, "model_registry")
    os.makedirs(registry_dir, exist_ok=True)

    # Save model binary
    model_path = os.path.join(registry_dir, "experimental_rf_v1.joblib")
    joblib.dump(final_model, model_path)

    # Build model registry entry
    registry_data = {
        "models": [
            {
                "model_id": "EXP-RF-001",
                "model_name": "Experimental Random Forest Phenotype Screening Prototype",
                "version": "1.0.0-research",
                "training_dataset": "synthetic_pcos_pmos_research_dataset.csv (N=500)",
                "dataset_licence": "Internal Synthetic Research License",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "algorithm": "RandomForestClassifier(n_estimators=100, max_depth=5)",
                "features": FEATURES,
                "feature_importances": sorted_importances,
                "validation_method": "5-Fold Stratified Cross Validation",
                "metrics": {
                    "roc_auc_mean": round(float(np.mean(auc_scores)), 4),
                    "accuracy_mean": round(float(np.mean(acc_scores)), 4),
                    "sensitivity_recall_mean": round(float(np.mean(rec_scores)), 4),
                    "specificity_mean": round(float(np.mean(spec_scores)), 4),
                    "precision_mean": round(float(np.mean(prec_scores)), 4),
                    "f1_score_mean": round(float(np.mean(f1_scores)), 4),
                    "brier_score_loss_mean": round(float(np.mean(brier_scores)), 4)
                },
                "calibration_status": "Brier score assessed; requires temperature scaling on external prospective data",
                "intended_use": "Research feature analysis and algorithm demonstration only.",
                "known_limitations": [
                    "Trained on synthetic data; uncalibrated on clinical populations.",
                    "Does not account for non-classic congenital adrenal hyperplasia (NCAH) bio-markers.",
                    "Must NEVER be deployed for patient-facing automated medical diagnosis."
                ],
                "approval_status": "experimental_research_only",
                "is_enabled_for_clinical_use": False
            }
        ]
    }

    registry_file = os.path.join(registry_dir, "registry.json")
    with open(registry_file, "w") as f:
        json.dump(registry_data, f, indent=2)

    print("Model training complete.")
    print(f"ROC-AUC: {np.mean(auc_scores):.4f} | Recall: {np.mean(rec_scores):.4f} | Specificity: {np.mean(spec_scores):.4f}")
    print(f"Saved registry to {registry_file}")

if __name__ == "__main__":
    train_and_evaluate()
