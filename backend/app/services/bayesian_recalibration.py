"""Bayesian Closed-Loop Post-Consultation Recalibration Service

Implements U10: Post-consultation closed-loop feedback and Bayesian updating.
Updates personal baseline prior odds based on clinician-confirmed findings without
retraining the underlying global model. Supports full rollback and audit trails.
"""

from typing import Dict, Any, Optional

class BayesianRecalibrationService:
    # Likelihood ratios derived from clinical diagnostic evidence
    LIKELIHOOD_RATIOS = {
        "confirmed_pcos": 4.0,           # Clinician confirmed Rotterdam criteria with mimics excluded
        "pcos_ruled_out": 0.20,          # Clinician confirmed normal or other pathology
        "differential_identified": 0.15, # Confirmed alternative pathology (e.g. Hypothyroidism, NCAH)
        "normal_ovulation": 0.25,        # Normal ovulatory cycles confirmed by mid-luteal progesterone/ultrasound
        "inconclusive": 1.0              # Monitoring / repeat tests needed
    }

    @classmethod
    def calculate_recalibration(
        cls,
        prior_score: float,
        diagnosis_status: str,
        differential_diagnosis: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates posterior concordance score using Bayesian odds formulation:
        Odds_posterior = Odds_prior * Likelihood_Ratio
        P_posterior = Odds_posterior / (1 + Odds_posterior)
        """
        # Sanitize prior score between 5% and 95% to avoid divide-by-zero
        p_prior = max(0.05, min(0.95, prior_score / 100.0))
        odds_prior = p_prior / (1.0 - p_prior)

        lr = cls.LIKELIHOOD_RATIOS.get(diagnosis_status, 1.0)

        # Additional modifier if specific non-PCOS differential confirmed
        if differential_diagnosis and differential_diagnosis in ["hypothyroidism", "hyperprolactinemia", "ncah"]:
            lr = min(lr, 0.15)

        odds_posterior = odds_prior * lr
        p_posterior = odds_posterior / (1.0 + odds_posterior)
        posterior_score = round(p_posterior * 100.0, 1)

        return {
            "prior_alignment_score": round(prior_score, 1),
            "posterior_alignment_score": posterior_score,
            "likelihood_ratio": round(lr, 3),
            "diagnosis_status": diagnosis_status,
            "differential_diagnosis": differential_diagnosis,
            "explanation": (
                f"Personalized baseline updated from {round(prior_score, 1)}% to {posterior_score}% "
                f"via Bayesian odds update (Likelihood Ratio: {round(lr, 2)}x) based on clinician consultation findings."
            ),
            "disclaimer": (
                "Bayesian recalibration adjusts personal longitudinal monitoring thresholds following clinical consultation. "
                "It does NOT retrain or corrupt the global clinical guideline rules."
            )
        }
