# AI Model Card Template & Model Registry Specification

Every machine learning model evaluated within the CycleAware research environment must have a completed Model Card serialized in `ml/model_registry/registry.json`.

---

## Model Card Specification

### 1. Model Details
- **Model ID**: Unique identifier (e.g. `EXP-RF-001`)
- **Model Name**: Descriptive title
- **Version**: Semantic version with development stage suffix (e.g. `1.0.0-research`)
- **Algorithm**: Exact estimator architecture and hyper-parameters
- **Date**: Training timestamp

### 2. Intended Use
- **Primary Intended Uses**: Research feature analysis, pattern correlation testing, pipeline validation.
- **Out-of-Scope & Prohibited Uses**: Direct patient diagnosis, clinical treatment decision-making, unregulated diagnostic claims.

### 3. Training & Validation Data
- **Dataset Origin**: Complete provenance, sample count (N), licensing.
- **Synthetic Status**: Explicit flag (`synthetic_status: true`).
- **Feature Set**: Exhaustive list of input feature columns.

### 4. Performance & Calibration Metrics
- **Validation Protocol**: K-fold stratified patient-level cross validation (minimum 5 folds).
- **Core Metrics**:
  - ROC-AUC
  - Sensitivity / Recall
  - Specificity
  - Precision / Positive Predictive Value
  - F1-Score
  - Brier Score Loss (Calibration quality)

### 5. Explainability & Feature Attributions
- Feature importance weights and directional influence vectors (SHAP values).

### 6. Clinical Safety Guardrail
- `is_enabled_for_clinical_use`: Boolean flag, hardcoded to `false` for all unvalidated research prototypes.
