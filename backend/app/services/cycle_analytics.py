import math
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from app.models.menstrual import MenstrualPeriod

def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%Y-%m-%d")

def format_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

class CycleAnalyticsService:
    @staticmethod
    def calculate_cycle_summaries(
        periods: List[MenstrualPeriod],
        user_age: Optional[int] = 25,
        menarche_age: Optional[int] = 13
    ) -> List[Dict[str, Any]]:
        if len(periods) < 2:
            return []

        # Sort chronologically
        sorted_periods = sorted(periods, key=lambda p: p.start_date)
        summaries = []

        years_post_menarche = (user_age - menarche_age) if (user_age and menarche_age) else 10
        min_normal = 21
        max_normal = 45 if (years_post_menarche < 3) else 35

        for i in range(len(sorted_periods) - 1):
            curr_p = sorted_periods[i]
            next_p = sorted_periods[i + 1]

            d_curr = parse_date(curr_p.start_date)
            d_next = parse_date(next_p.start_date)

            cycle_length = (d_next - d_curr).days
            if cycle_length <= 0:
                continue

            bleeding_days = None
            if curr_p.end_date:
                d_end = parse_date(curr_p.end_date)
                bleeding_days = max(1, (d_end - d_curr).days + 1)

            is_irregular = (cycle_length < min_normal or cycle_length > max_normal)

            summaries.append({
                "id": f"summary_{curr_p.id}",
                "cycle_start_date": curr_p.start_date,
                "cycle_end_date": format_date(d_next - timedelta(days=1)),
                "cycle_length_days": cycle_length,
                "bleeding_duration_days": bleeding_days,
                "is_irregular_by_guideline": is_irregular,
                "calculated_at": datetime.utcnow()
            })

        return summaries

    @staticmethod
    def calculate_beta_drift(lengths: List[int]) -> Dict[str, Any]:
        """
        Calculates longitudinal cycle-length drift slope (beta_drift) over consecutive cycles.
        Uses robust linear trend estimation across the rolling cycle series (3 to 6 cycles).
        Identifies potential data-entry anomalies (>120 days or <15 days) without treating them
        as genuine linear physiological trends.
        """
        n = len(lengths)
        if n < 3:
            return {
                "beta_drift_slope": None,
                "trend_direction": "insufficient_data",
                "standard_error": None,
                "r_squared": None,
                "cycles_evaluated": n,
                "confidence_level": "insufficient_data",
                "is_outlier_detected": False,
                "explanation": f"Tracked {n} completed cycle(s). At least 3 consecutive cycles are required to estimate longitudinal drift.",
                "scientific_disclaimer": (
                    "Beta_drift represents mathematical trend slope in cycle length over time. "
                    "It is a longitudinal tracking metric and does NOT establish anovulation or PCOS."
                )
            }

        # Use recent 3 to 6 cycles
        recent_window = lengths[-6:] if n > 6 else lengths
        m = len(recent_window)

        # Detect potential data anomalies
        is_outlier = any(l < 15 or l > 120 for l in recent_window)
        # Robust filtering: if extreme outlier present, cap for calculation or note uncertainty
        sanitized_lengths = [max(15, min(120, l)) for l in recent_window]

        x = list(range(1, m + 1))
        y = sanitized_lengths
        x_bar = sum(x) / m
        y_bar = sum(y) / m

        numerator = sum((x[i] - x_bar) * (y[i] - y_bar) for i in range(m))
        denominator = sum((x[i] - x_bar) ** 2 for i in range(m))

        slope = (numerator / denominator) if denominator != 0 else 0.0

        # Residual standard error and R-squared
        y_pred = [y_bar + slope * (x[i] - x_bar) for i in range(m)]
        ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(m))
        ss_tot = sum((y[i] - y_bar) ** 2 for i in range(m))
        r2 = (1 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

        se = math.sqrt(ss_res / (m - 2)) / math.sqrt(denominator) if (m > 2 and denominator > 0) else 0.0

        if abs(slope) <= 0.75:
            direction = "stable"
            expl = f"Longitudinal cycle duration is stable (slope {round(slope, 2)} days/cycle across {m} cycles)."
        elif slope > 0.75:
            direction = "lengthening"
            expl = f"Cycle lengths demonstrate a lengthening trend (+{round(slope, 2)} days/cycle)."
        else:
            direction = "shortening"
            expl = f"Cycle lengths demonstrate a shortening trend ({round(slope, 2)} days/cycle)."

        conf = "high" if m >= 5 and not is_outlier else ("medium" if m >= 3 and not is_outlier else "low")

        return {
            "beta_drift_slope": round(slope, 2),
            "trend_direction": direction,
            "standard_error": round(se, 2),
            "r_squared": round(max(0.0, r2), 3),
            "cycles_evaluated": m,
            "confidence_level": conf,
            "is_outlier_detected": is_outlier,
            "explanation": expl,
            "scientific_disclaimer": (
                "Beta_drift represents mathematical trend slope in cycle length over time. "
                "It is a longitudinal tracking metric and does NOT establish anovulation or PCOS."
            )
        }

    @staticmethod
    def get_phase_checkpoint(
        last_period_date_str: Optional[str],
        median_cycle_length: Optional[float] = 28.0,
        current_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Determines the appropriate phase-aware checkpoint prompt (onset, mid-cycle, luteal).
        Non-intrusive micro-logging framework replacing cumbersome daily quizzes.
        """
        if not last_period_date_str:
            return {
                "current_cycle_day": None,
                "estimated_phase": "uncertain",
                "checkpoint_active": False,
                "checkpoint_type": None,
                "checkpoint_title": "Welcome to Phase Check-ins",
                "checkpoint_prompt": "Log your period start date to activate tailored phase check-ins.",
                "suggested_symptom_codes": ["cramps", "fatigue"],
                "can_skip": True,
                "disclaimer": "Cycle phase estimation is an educational tracking guide and does not confirm ovulation."
            }

        ref_date = current_date or date.today()
        last_start = parse_date(last_period_date_str).date()
        cycle_day = (ref_date - last_start).days + 1

        cycle_len = int(round(median_cycle_length or 28.0))
        mid_target = cycle_len // 2

        # Checkpoints:
        # 1. Menstrual Flow Onset: Days 1 to 4
        if 1 <= cycle_day <= 4:
            return {
                "current_cycle_day": cycle_day,
                "estimated_phase": "menstrual_flow",
                "checkpoint_active": True,
                "checkpoint_type": "menstrual_flow",
                "checkpoint_title": "Checkpoint 1: Menstrual Flow Onset",
                "checkpoint_prompt": "Day " + str(cycle_day) + " of your cycle. How is your flow intensity, pelvic cramping, or fatigue today?",
                "suggested_symptom_codes": ["pelvic_pain", "menstrual_cramps", "fatigue", "headache"],
                "can_skip": True,
                "disclaimer": "Self-reported flow observations help contextualize cycle regularity."
            }

        # 2. Mid-Cycle Window: mid_target - 2 to mid_target + 2
        elif (mid_target - 2) <= cycle_day <= (mid_target + 2):
            return {
                "current_cycle_day": cycle_day,
                "estimated_phase": "mid_cycle",
                "checkpoint_active": True,
                "checkpoint_type": "mid_cycle",
                "checkpoint_title": "Checkpoint 2: Mid-Cycle Window",
                "checkpoint_prompt": (
                    f"Day {cycle_day} of your estimated {cycle_len}-day cycle. "
                    "Noticing any mid-cycle ovulatory twinges, cervical fluid changes, or skin shifts?"
                ),
                "suggested_symptom_codes": ["ovulatory_pain", "cervical_mucus_change", "facial_acne", "bloating"],
                "can_skip": True,
                "disclaimer": "CRITICAL: Calendar-derived mid-cycle windows do NOT confirm ovulation. True ovulation requires clinical confirmation."
            }

        # 3. Luteal Phase Window: (cycle_len - 6) to (cycle_len - 1)
        elif (cycle_len - 6) <= cycle_day <= (cycle_len - 1):
            return {
                "current_cycle_day": cycle_day,
                "estimated_phase": "luteal_phase",
                "checkpoint_active": True,
                "checkpoint_type": "luteal_phase",
                "checkpoint_title": "Checkpoint 3: Premenstrual Luteal Check-in",
                "checkpoint_prompt": (
                    f"Day {cycle_day} (late luteal phase). "
                    "Experiencing any premenstrual mood shifts, breast tenderness, or carbohydrate cravings?"
                ),
                "suggested_symptom_codes": ["mood_swings", "irritability", "carb_craving", "breast_tenderness", "sleep_disruption"],
                "can_skip": True,
                "disclaimer": "Luteal symptom micro-logs aid in evaluating premenstrual symptom patterns."
            }

        # Interim days
        return {
            "current_cycle_day": cycle_day,
            "estimated_phase": "follicular_interim" if cycle_day < mid_target else "post_luteal",
            "checkpoint_active": False,
            "checkpoint_type": None,
            "checkpoint_title": f"Cycle Day {cycle_day}",
            "checkpoint_prompt": "No scheduled checkpoint today. You can log spontaneous observations anytime.",
            "suggested_symptom_codes": [],
            "can_skip": True,
            "disclaimer": "Scheduled checkpoints focus on flow onset, mid-cycle, and premenstrual phases."
        }

    @staticmethod
    def compute_analytics(
        periods: List[MenstrualPeriod],
        user_age: Optional[int] = 25,
        menarche_age: Optional[int] = 13
    ) -> Dict[str, Any]:
        summaries = CycleAnalyticsService.calculate_cycle_summaries(periods, user_age, menarche_age)
        total_cycles = len(summaries)

        if total_cycles == 0:
            return {
                "total_recorded_cycles": 0,
                "average_cycle_length": None,
                "median_cycle_length": None,
                "min_cycle_length": None,
                "max_cycle_length": None,
                "cycle_length_variation_std": None,
                "average_bleeding_duration": None,
                "irregular_cycles_count": 0,
                "has_sufficient_data": False,
                "guideline_status": "Insufficient tracking data (0 completed cycles).",
                "beta_drift": CycleAnalyticsService.calculate_beta_drift([]),
                "cycle_history": [],
                "prediction": {
                    "predicted_start_date": None,
                    "window_start_date": None,
                    "window_end_date": None,
                    "confidence_level": "insufficient_data",
                    "cycle_count_used": 0,
                    "method_used": "rolling_median_variance",
                    "explanation": "Log at least two consecutive periods to compute your first cycle length."
                }
            }

        lengths = [s["cycle_length_days"] for s in summaries]
        bleeding_lengths = [s["bleeding_duration_days"] for s in summaries if s["bleeding_duration_days"] is not None]

        avg_len = sum(lengths) / total_cycles
        sorted_lengths = sorted(lengths)
        if total_cycles % 2 == 1:
            median_len = float(sorted_lengths[total_cycles // 2])
        else:
            median_len = (sorted_lengths[total_cycles // 2 - 1] + sorted_lengths[total_cycles // 2]) / 2.0

        min_len = min(lengths)
        max_len = max(lengths)

        if total_cycles > 1:
            variance = sum((x - avg_len) ** 2 for x in lengths) / (total_cycles - 1)
            std_dev = math.sqrt(variance)
        else:
            std_dev = 0.0

        avg_bleeding = (sum(bleeding_lengths) / len(bleeding_lengths)) if bleeding_lengths else None
        irregular_count = sum(1 for s in summaries if s["is_irregular_by_guideline"])
        has_sufficient = total_cycles >= 3

        # Beta drift calculation
        beta_drift_res = CycleAnalyticsService.calculate_beta_drift(lengths)

        # Prediction calculation
        last_period = sorted(periods, key=lambda p: p.start_date)[-1]
        last_start = parse_date(last_period.start_date)

        if has_sufficient:
            pred_start_dt = last_start + timedelta(days=int(round(median_len)))
            margin_days = max(2, int(math.ceil(std_dev)))
            window_start_dt = pred_start_dt - timedelta(days=margin_days)
            window_end_dt = pred_start_dt + timedelta(days=margin_days)

            if std_dev <= 3.0:
                conf = "high"
                expl = f"High consistency (variation +/- {round(std_dev, 1)} days across {total_cycles} cycles)."
            elif std_dev <= 7.0:
                conf = "medium"
                expl = f"Moderate variation (+/- {round(std_dev, 1)} days across {total_cycles} cycles)."
            else:
                conf = "low"
                expl = f"Elevated variation (+/- {round(std_dev, 1)} days). Prediction window is wide."

            prediction = {
                "predicted_start_date": format_date(pred_start_dt),
                "window_start_date": format_date(window_start_dt),
                "window_end_date": format_date(window_end_dt),
                "confidence_level": conf,
                "cycle_count_used": total_cycles,
                "method_used": "rolling_median_variance",
                "explanation": expl
            }
        else:
            prediction = {
                "predicted_start_date": None,
                "window_start_date": None,
                "window_end_date": None,
                "confidence_level": "insufficient_data",
                "cycle_count_used": total_cycles,
                "method_used": "rolling_median_variance",
                "explanation": f"Tracked {total_cycles} cycle(s). At least 3 completed cycles are required for reliable statistical predictions."
            }

        guideline_status = (
            f"{irregular_count} of {total_cycles} cycles were irregular by 2023 international guidelines."
            if irregular_count > 0 else "All recorded cycles fall within international reference guidelines."
        )

        return {
            "total_recorded_cycles": total_cycles,
            "average_cycle_length": round(avg_len, 1),
            "median_cycle_length": round(median_len, 1),
            "min_cycle_length": min_len,
            "max_cycle_length": max_len,
            "cycle_length_variation_std": round(std_dev, 1),
            "average_bleeding_duration": round(avg_bleeding, 1) if avg_bleeding else None,
            "irregular_cycles_count": irregular_count,
            "has_sufficient_data": has_sufficient,
            "guideline_status": guideline_status,
            "beta_drift": beta_drift_res,
            "cycle_history": summaries,
            "prediction": prediction
        }
