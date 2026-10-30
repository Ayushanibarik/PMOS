"""Synthetic PCOS/PMOS Research Dataset Generator

Produces a reproducible, scientifically structured synthetic dataset for pipeline
testing, model training, and explainability evaluation.

DISCLAIMER:
This dataset is 100% SYNTHETIC. It is designed exclusively for software demonstration,
feature pipeline validation, and testing. It must NEVER be represented as real patient data
or clinical validation evidence.
"""

import os
import json
import numpy as np
import pandas as pd

def generate_dataset(n_samples: int = 500, random_seed: int = 42):
    np.random.seed(random_seed)

    # Patient demographics
    age = np.random.normal(loc=26.5, scale=5.2, size=n_samples).clip(18, 45).round(1)
    menarche_age = np.random.normal(loc=13.0, scale=1.4, size=n_samples).clip(10, 17).round(0)
    years_post_menarche = (age - menarche_age).clip(1, 35).round(1)

    # Underlying latent risk factor (synthetic phenotype simulation)
    latent_risk = (
        0.35 * (np.random.beta(a=2, b=4, size=n_samples)) +
        0.25 * (years_post_menarche > 3)
    )

    # Binary synthetic label based on probabilistic threshold
    prob_pcos = 1 / (1 + np.exp(-3.5 * (latent_risk - 0.45)))
    target = (np.random.uniform(0, 1, size=n_samples) < prob_pcos).astype(int)

    # Feature distributions conditioned on synthetic phenotype
    # 1. Menstrual cycle length & variability
    mean_cycle_length = np.where(
        target == 1,
        np.random.normal(loc=44.0, scale=12.0, size=n_samples).clip(21, 110),
        np.random.normal(loc=29.0, scale=2.5, size=n_samples).clip(24, 35)
    ).round(1)

    cycle_length_std = np.where(
        target == 1,
        np.random.normal(loc=8.5, scale=3.5, size=n_samples).clip(2.0, 22.0),
        np.random.normal(loc=1.8, scale=0.8, size=n_samples).clip(0.5, 4.0)
    ).round(1)

    skipped_cycles_per_year = np.where(
        target == 1,
        np.random.poisson(lam=3.2, size=n_samples).clip(0, 8),
        np.random.poisson(lam=0.2, size=n_samples).clip(0, 1)
    )

    # 2. Hyperandrogenism markers (self-reported severity 0 to 5)
    hirsutism_score = np.where(
        target == 1,
        np.random.normal(loc=3.2, scale=1.1, size=n_samples).clip(0, 5).round(0),
        np.random.normal(loc=0.8, scale=0.7, size=n_samples).clip(0, 3).round(0)
    ).astype(int)

    acne_severity = np.where(
        target == 1,
        np.random.normal(loc=2.8, scale=1.2, size=n_samples).clip(0, 5).round(0),
        np.random.normal(loc=1.1, scale=0.9, size=n_samples).clip(0, 4).round(0)
    ).astype(int)

    hair_thinning_severity = np.where(
        target == 1,
        np.random.normal(loc=2.1, scale=1.3, size=n_samples).clip(0, 5).round(0),
        np.random.normal(loc=0.5, scale=0.6, size=n_samples).clip(0, 3).round(0)
    ).astype(int)

    # 3. Anthropometric & Metabolic features
    bmi = np.where(
        target == 1,
        np.random.normal(loc=27.8, scale=4.8, size=n_samples).clip(18.5, 45.0),
        np.random.normal(loc=22.6, scale=3.1, size=n_samples).clip(18.0, 35.0)
    ).round(1)

    waist_cm = (bmi * 2.8 + np.random.normal(loc=8.0, scale=4.0, size=n_samples)).clip(60, 125).round(1)

    # 4. Optional Fasting Glucose (mg/dL)
    fasting_glucose = np.where(
        target == 1,
        np.random.normal(loc=98.0, scale=14.0, size=n_samples).clip(75, 160),
        np.random.normal(loc=88.0, scale=8.0, size=n_samples).clip(70, 120)
    ).round(1)

    df = pd.DataFrame({
        "patient_id": [f"SYNTH_{i:04d}" for i in range(n_samples)],
        "age": age,
        "menarche_age": menarche_age,
        "years_post_menarche": years_post_menarche,
        "mean_cycle_length": mean_cycle_length,
        "cycle_length_std": cycle_length_std,
        "skipped_cycles_per_year": skipped_cycles_per_year,
        "hirsutism_score": hirsutism_score,
        "acne_severity": acne_severity,
        "hair_thinning_severity": hair_thinning_severity,
        "bmi": bmi,
        "waist_cm": waist_cm,
        "fasting_glucose": fasting_glucose,
        "synthetic_phenotype_flag": target
    })

    # Save
    out_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out_dir, exist_ok=True)
    csv_path = os.path.join(out_dir, "synthetic_pcos_pmos_research_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} synthetic records -> {csv_path}")

    # Data dictionary
    data_dict = {
        "dataset_name": "Synthetic PCOS/PMOS Research Cohort",
        "version": "1.0-synthetic",
        "description": "Synthetic dataset modeling menstrual irregularity, hyperandrogenism, and metabolic indicators.",
        "sample_count": n_samples,
        "target_variable": "synthetic_phenotype_flag (0 = typical reference pattern, 1 = simulated PCOS/PMOS pattern)",
        "synthetic_status": True,
        "intended_use": "Software pipeline testing, feature transformation verification, and non-clinical demonstrations.",
        "prohibited_use": "Direct clinical diagnosis, patient risk stratification, or clinical device submissions."
    }
    with open(os.path.join(out_dir, "data_dictionary.json"), "w") as f:
        json.dump(data_dict, f, indent=2)

if __name__ == "__main__":
    generate_dataset()
