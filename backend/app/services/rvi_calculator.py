"""Regrowth Velocity Index (RVI) & Melanin-Aware Cosmetic Compensation Service

Implements U04: Mathematical calculation of cosmetic grooming compensation and
Individual Typology Angle (ITA°) skin tone calibration across diverse South Asian skin types.
"""

import math
from typing import Dict, Any, Optional

class RviCalculatorService:
    MODALITY_COEFFICIENTS = {
        "shaving": 1.0,           # Hair cut at skin surface; rapid visible reappearance
        "threading": 2.2,         # Root plucked; epilation latency
        "plucking": 2.2,
        "waxing": 2.5,            # Mechanical epilation with follicular disturbance
        "laser": 3.5,             # Photothermolysis; extended latency if active
        "depilatory_cream": 1.2,  # Chemical dissolution below epidermis
        "none": 1.0
    }

    @classmethod
    def calculate_ita_skin_category(cls, ita_angle: float) -> str:
        """Classifies Individual Typology Angle (ITA°) according to dermatological standards."""
        if ita_angle > 55.0:
            return "Very Light (ITA > 55°)"
        elif ita_angle > 41.0:
            return "Light (41° < ITA <= 55°)"
        elif ita_angle > 28.0:
            return "Intermediate (28° < ITA <= 41°)"
        elif ita_angle > 10.0:
            return "Tan (10° < ITA <= 28°)"
        elif ita_angle > -30.0:
            return "Brown (-30° < ITA <= 10°)"
        else:
            return "Dark (ITA <= -30°)"

    @classmethod
    def compute_rvi(
        cls,
        observed_severity: int,
        grooming_modality: str,
        days_since_grooming: int,
        ita_angle: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates RVI = (Severity * Modality_Coefficient) / max(1, Days_Elapsed)
        """
        modality = grooming_modality.lower().strip()
        c_mod = cls.MODALITY_COEFFICIENTS.get(modality, 1.0)
        days = max(1, days_since_grooming)

        # Regrowth Velocity Index
        rvi = round((float(observed_severity) * c_mod) / float(days), 2)

        if rvi >= 2.5:
            category = "elevated"
            expl = f"Elevated regrowth velocity ({rvi} index) relative to {modality} interval ({days} days)."
        elif rvi >= 1.0:
            category = "moderate"
            expl = f"Moderate regrowth velocity ({rvi} index) relative to {modality} interval ({days} days)."
        else:
            category = "baseline"
            expl = f"Baseline regrowth velocity ({rvi} index) with {days} days since last {modality}."

        ita_cat = cls.calculate_ita_skin_category(ita_angle) if ita_angle is not None else None

        return {
            "rvi_score": rvi,
            "modality_coefficient": c_mod,
            "growth_velocity_category": category,
            "ita_skin_tone_category": ita_cat,
            "explanation": expl,
            "disclaimer": (
                "RVI is an algorithmic cosmetic compensation score to track hair regrowth patterns "
                "relative to grooming interventions (waxing/threading/shaving). "
                "It is NOT a direct biochemical measurement of circulating androgens."
            )
        }
