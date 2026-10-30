"""Phase-Locked Laboratory & Pelvic Ultrasound Scheduling Service

Implements U09: Clinically contextualized test reminder schedules based on
menstrual cycle phase, with adolescent and non-stigmatizing ultrasound guardrails.
"""

from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional

def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str, "%Y-%m-%d").date()

def format_date(d: date) -> str:
    return d.strftime("%Y-%m-%d")

class LabSchedulingService:
    @classmethod
    def generate_recommended_schedule(
        cls,
        last_period_date_str: Optional[str],
        median_cycle_length: float = 28.0,
        user_age: int = 25,
        years_post_menarche: int = 10,
        current_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        ref_date = current_date or date.today()
        cycle_len = int(round(median_cycle_length or 28.0))

        # Determine target cycle start date
        if last_period_date_str:
            last_start = parse_date(last_period_date_str)
            cycle_day = (ref_date - last_start).days + 1
            if cycle_day <= 4:
                # In current follicular window
                follicular_start = last_start + timedelta(days=1) # Day 2
                follicular_end = last_start + timedelta(days=3)   # Day 4
            else:
                # Next predicted cycle
                next_cycle_start = last_start + timedelta(days=cycle_len)
                follicular_start = next_cycle_start + timedelta(days=1)
                follicular_end = next_cycle_start + timedelta(days=3)
            
            luteal_target = last_start + timedelta(days=max(14, cycle_len - 7))
        else:
            follicular_start = ref_date + timedelta(days=7)
            follicular_end = ref_date + timedelta(days=10)
            luteal_target = ref_date + timedelta(days=21)

        schedule = []

        # 1. Early Follicular Phase Hormone Panel (Days 2-4)
        schedule.append({
            "test_name": "Early Follicular Hormone Panel (Testosterone, LH, FSH, Estradiol, 17-OHP)",
            "test_category": "follicular_day_2_to_4",
            "recommended_timing": "Cycle Days 2 to 4 of spontaneous menses (Morning 8:00 AM - 10:00 AM)",
            "due_date_start": format_date(follicular_start),
            "due_date_end": format_date(follicular_end),
            "clinical_rationale": (
                "2023 International Guidelines: Baseline follicular phase minimizes confounding steroid "
                "feedback from luteal progesterone. 17-OHP is required to rule out Late-Onset CAH."
            ),
            "preparation_instructions": "Overnight fasting recommended. Avoid vigorous exercise prior to blood draw.",
            "imaging_guidance": None,
            "status": "pending"
        })

        # 2. Mid-Luteal Ovulatory Confirmation (Day 21 or Cycle Length - 7)
        schedule.append({
            "test_name": "Mid-Luteal Serum Progesterone",
            "test_category": "mid_luteal_progesterone",
            "recommended_timing": f"Approximately 7 days before anticipated menses (Day {max(14, cycle_len - 7)})",
            "due_date_start": format_date(luteal_target - timedelta(days=1)),
            "due_date_end": format_date(luteal_target + timedelta(days=1)),
            "clinical_rationale": "Objectively verifies spontaneous ovulation (>3 ng/mL confirms ovulatory luteal function).",
            "preparation_instructions": "Routine venous blood draw; fasting not required.",
            "imaging_guidance": None,
            "status": "pending"
        })

        # 3. Cardiometabolic & Insulin Resistance Screening
        schedule.append({
            "test_name": "Cardiometabolic Panel (Fasting Glucose, Fasting Insulin, Lipid Profile)",
            "test_category": "fasting_morning",
            "recommended_timing": "Any day of cycle (Strict morning fasting)",
            "due_date_start": format_date(ref_date + timedelta(days=2)),
            "due_date_end": format_date(ref_date + timedelta(days=14)),
            "clinical_rationale": "Screens for metabolic dysregulation and compensatory hyperinsulinemia common in South Asian phenotypes.",
            "preparation_instructions": "Strict 10-12 hour overnight fast. Plain water is permitted.",
            "imaging_guidance": None,
            "status": "pending"
        })

        # 4. Mandatory Differential Pathology Exclusions
        schedule.append({
            "test_name": "Endocrine Differential Exclusions (TSH, Prolactin)",
            "test_category": "differential_exclusion",
            "recommended_timing": "Any day of cycle (Morning)",
            "due_date_start": format_date(ref_date + timedelta(days=2)),
            "due_date_end": format_date(ref_date + timedelta(days=14)),
            "clinical_rationale": "Mandatory international guideline requirement: Exclude hypothyroidism and hyperprolactinemia prior to PCOS assessment.",
            "preparation_instructions": "Fasting optional; draw after at least 1 hour of waking for stable prolactin.",
            "imaging_guidance": None,
            "status": "pending"
        })

        # 5. Pelvic Imaging Guardrail
        is_adolescent = years_post_menarche < 8
        if is_adolescent:
            imaging_notes = (
                "ADOLESCENT SAFETY GUARDRAIL: International consensus strictly advises against using pelvic ultrasound "
                "or AMH for PCOS diagnosis in adolescents (<8 years from menarche), as multicystic ovarian morphology "
                "is a normal developmental finding in healthy young women."
            )
        else:
            imaging_notes = (
                "NON-STIGMATIZING IMAGING PROTOCOL: Pelvic ultrasound modality is determined strictly by clinical need "
                "and patient preference, NEVER by marital status. Transabdominal Ultrasound (TAS) with a full bladder is "
                "the standard non-invasive approach. Transvaginal Ultrasound (TVS) offers higher follicular detail but requires "
                "explicit informed consent."
            )

        schedule.append({
            "test_name": "Pelvic Ultrasound Assessment (Morphology & Ovarian Volume)",
            "test_category": "pelvic_ultrasound",
            "recommended_timing": "If clinically prescribed by your gynecologist",
            "due_date_start": format_date(ref_date + timedelta(days=14)),
            "due_date_end": format_date(ref_date + timedelta(days=45)),
            "clinical_rationale": "Evaluates ovarian volume (>=10 mL) and antral follicle distribution when clinically indicated in adults.",
            "preparation_instructions": "Drink 1 liter of water 1 hour prior to scan for transabdominal pelvic acoustic window.",
            "imaging_guidance": imaging_notes,
            "status": "pending"
        })

        return schedule
