import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models.menstrual import MenstrualPeriod

def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%Y-%m-%d")

def format_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

class CycleAnalyticsService:
    @staticmethod
    def calculate_cycle_summaries(periods: List[MenstrualPeriod], user_age: Optional[int] = 25, menarche_age: Optional[int] = 13) -> List[Dict[str, Any]]:
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
    def compute_analytics(periods: List[MenstrualPeriod], user_age: Optional[int] = 25, menarche_age: Optional[int] = 13) -> Dict[str, Any]:
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
            "cycle_history": summaries,
            "prediction": prediction
        }
