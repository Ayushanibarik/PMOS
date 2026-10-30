"""Evidence-Informed Clinical Rule Observation Engine

Based on:
International Evidence-Based Guideline for the Assessment and Management of
Polycystic Ovary Syndrome (PCOS / PMOS), 2023 Edition & Monash Guidelines.

CRITICAL INVARIANTS:
1. This engine NEVER outputs a medical diagnosis.
2. Distinguishes between normal developmental variation (adolescents within 1-3 years of menarche)
   and patterns warranting clinical attention.
3. Protects adolescents (<8 years post-menarche) from inappropriate ultrasound/AMH diagnostic labeling.
4. Highlights the necessity of clinical differential diagnosis (Thyroid, Prolactin, CAH).
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date

class ClinicalObservation:
    def __init__(
        self,
        category: str,
        observation_type: str,
        title: str,
        description: str,
        evidence_details: str,
        recommendation: str,
        trigger_data: Optional[Dict[str, Any]] = None
    ):
        self.category = category
        self.observation_type = observation_type
        self.title = title
        self.description = description
        self.evidence_details = evidence_details
        self.recommendation = recommendation
        self.trigger_data = trigger_data or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "observation_type": self.observation_type,
            "title": self.title,
            "description": self.description,
            "evidence_details": self.evidence_details,
            "recommendation": self.recommendation,
            "rule_version": "2023_international_guideline_v1.0",
            "trigger_data": self.trigger_data
        }

class ClinicalRuleEngine:
    GUIDELINE_VERSION = "2023_international_guideline_v1.0"
    GUIDELINE_CITATION = (
        "International evidence-based guideline for the assessment and management of "
        "polycystic ovary syndrome (PCOS/PMOS) 2023; Monash University."
    )

    @classmethod
    def evaluate(
        cls,
        user_profile: Any,
        cycles: List[Dict[str, Any]],
        symptoms: List[Dict[str, Any]],
        measurements: List[Dict[str, Any]],
        lab_results: List[Dict[str, Any]]
    ) -> List[ClinicalObservation]:
        observations: List[ClinicalObservation] = []

        age = getattr(user_profile, "age", None) or 25
        menarche_age = getattr(user_profile, "menarche_age", None)
        years_post_menarche = (age - menarche_age) if (age and menarche_age) else 10
        is_under_18 = getattr(user_profile, "is_under_18", False) or (age < 18 if age else False)
        using_hormonal_contraception = getattr(user_profile, "using_hormonal_contraception", False)

        # -------------------------------------------------------------
        # Rule 1: Data Sufficiency Check
        # -------------------------------------------------------------
        if len(cycles) < 3:
            observations.append(ClinicalObservation(
                category="data_sufficiency",
                observation_type="data_insufficiency",
                title="Early Tracking Phase — More History Needed",
                description=(
                    f"You have recorded {len(cycles)} cycle(s). Longitudinal menstrual monitoring "
                    "requires tracking at least 3 to 6 consecutive cycles to identify personal physiological patterns."
                ),
                evidence_details="International guidelines emphasize longitudinal tracking rather than single-cycle snapshots.",
                recommendation="Continue logging period start and end dates as each cycle occurs.",
                trigger_data={"recorded_cycles_count": len(cycles)}
            ))

        # -------------------------------------------------------------
        # Rule 2: Hormonal Contraception Context
        # -------------------------------------------------------------
        if using_hormonal_contraception:
            observations.append(ClinicalObservation(
                category="cycle_regularity",
                observation_type="pattern_observation",
                title="Hormonal Contraception Influences Cycle Patterns",
                description=(
                    "Bleeding patterns experienced while using hormonal contraception are withdrawal "
                    "bleeds rather than spontaneous ovulatory menstrual cycles."
                ),
                evidence_details="Exogenous hormones suppress the hypothalamic-pituitary-ovarian axis.",
                recommendation="Consult your healthcare provider regarding hormone-free evaluation if assessing baseline ovulatory function.",
                trigger_data={"using_hormonal_contraception": True}
            ))

        # -------------------------------------------------------------
        # Rule 3: Adolescent Safety & Developmental Windows
        # -------------------------------------------------------------
        if is_under_18 or (years_post_menarche is not None and years_post_menarche < 3):
            if years_post_menarche is not None and years_post_menarche <= 1:
                observations.append(ClinicalObservation(
                    category="adolescent_guidance",
                    observation_type="pattern_observation",
                    title="Normal Pubertal Maturation Window",
                    description=(
                        "Irregular cycle intervals are very common during the first 1 to 2 years after menarche "
                        "as the ovulatory axis gradually matures. This is a normal developmental phase."
                    ),
                    evidence_details="2023 International Guideline: Post-menarche year 1 irregularity reflects normal pubertal transition.",
                    recommendation="Maintain a gentle tracking record without undue anxiety. Discuss severe pain or bleeding >7 days with a pediatrician or gynecologist."
                ))
            elif years_post_menarche is not None and 1 < years_post_menarche < 3:
                # Check for cycles < 21 or > 45 days
                abnormal_cycles = [c for c in cycles if c.get("cycle_length_days", 28) < 21 or c.get("cycle_length_days", 28) > 45]
                if abnormal_cycles:
                    observations.append(ClinicalObservation(
                        category="cycle_regularity",
                        observation_type="follow_up_observation",
                        title="Cycles Outside 21-45 Day Reference Range",
                        description=(
                            f"{len(abnormal_cycles)} recorded cycle(s) were shorter than 21 days or longer than 45 days, "
                            "which falls outside the developmental reference range for 1-3 years post-menarche."
                        ),
                        evidence_details="2023 International Guideline: 1 to <3 years post-menarche normal range is 21 to 45 days.",
                        recommendation="Consider sharing this cycle log with your healthcare professional for reassurance and personalized guidance.",
                        trigger_data={"abnormal_cycles_count": len(abnormal_cycles)}
                    ))
            
            # Adolescent Ultrasound & AMH Guardrail Warning
            observations.append(ClinicalObservation(
                category="adolescent_guidance",
                observation_type="pattern_observation",
                title="Adolescent Diagnostic Guardrail (Ultrasound & AMH)",
                description=(
                    "International clinical consensus advises against using pelvic ultrasound or AMH (Anti-Müllerian Hormone) "
                    "as diagnostic tools in adolescents (<8 years from menarche), as multi-follicular ovaries are normal at this age."
                ),
                evidence_details="2023 International Guideline: Low diagnostic specificity of ultrasound and AMH in adolescents.",
                recommendation="If medical evaluation occurs, diagnosis in young women should focus on clinical hyperandrogenism and persistent ovulatory dysfunction."
            ))

        # -------------------------------------------------------------
        # Rule 4: Adult Menstrual Regularity Reference Framework
        # -------------------------------------------------------------
        elif years_post_menarche is not None and years_post_menarche >= 3 and not using_hormonal_contraception:
            irregular_cycles = [
                c for c in cycles
                if c.get("cycle_length_days", 28) < 21 or c.get("cycle_length_days", 28) > 35
            ]
            prolonged_cycles = [
                c for c in cycles
                if c.get("cycle_length_days", 28) > 90
            ]

            if prolonged_cycles:
                observations.append(ClinicalObservation(
                    category="cycle_regularity",
                    observation_type="follow_up_observation",
                    title="Prolonged Cycle Interval (>90 Days Recorded)",
                    description=(
                        f"A cycle interval of {prolonged_cycles[0].get('cycle_length_days')} days was recorded. "
                        "Intervals exceeding 90 days (secondary amenorrhea) warrant professional medical evaluation."
                    ),
                    evidence_details="2023 International Guideline: Any cycle >90 days beyond the first post-menarche year warrants clinical assessment.",
                    recommendation="Schedule a consultation with a qualified gynecologist or endocrinologist to assess underlying ovulatory health.",
                    trigger_data={"max_cycle_length": max(c.get("cycle_length_days", 0) for c in prolonged_cycles)}
                ))
            elif len(irregular_cycles) >= 2:
                observations.append(ClinicalObservation(
                    category="cycle_regularity",
                    observation_type="follow_up_observation",
                    title="Frequent Cycle Length Variation",
                    description=(
                        f"{len(irregular_cycles)} of your tracked cycles fell outside the standard 21–35 day adult range. "
                        "Consistent cycle variability can be an indicator of irregular ovulation (oligo-ovulation)."
                    ),
                    evidence_details="2023 International Guideline: Adult ovulatory reference interval is 21–35 days or >=8 cycles per year.",
                    recommendation="Review your cycle timeline with a doctor. Consider tracking whether cycle irregularity is accompanied by physical symptoms.",
                    trigger_data={"irregular_cycle_count": len(irregular_cycles), "total_cycles": len(cycles)}
                ))
            elif len(cycles) >= 3 and not irregular_cycles:
                observations.append(ClinicalObservation(
                    category="cycle_regularity",
                    observation_type="no_notable_change",
                    title="Cycles Within Standard Reference Range",
                    description="Your tracked cycles fall consistently within the 21–35 day adult reference interval.",
                    evidence_details="Consistent cycle duration suggests regular ovulatory cycles.",
                    recommendation="Continue periodic logging. Remember that ovulatory patterns can shift with sleep, stress, or health changes."
                ))

        # -------------------------------------------------------------
        # Rule 5: Clinical Hyperandrogenism Pattern Check
        # -------------------------------------------------------------
        hair_symptoms = [s for s in symptoms if s.get("category") == "hair" and s.get("severity", 0) >= 3]
        severe_acne = [s for s in symptoms if s.get("symptom_code") in ("facial_acne", "body_acne") and s.get("severity", 0) >= 3]

        if hair_symptoms or severe_acne:
            details = []
            if hair_symptoms:
                details.append("moderate-to-high severity unwanted hair growth or scalp hair thinning")
            if severe_acne:
                details.append("persistent moderate-to-severe acne")
            
            symptom_str = " and ".join(details)
            observations.append(ClinicalObservation(
                category="hyperandrogenism_signs",
                observation_type="pattern_observation",
                title="Observation: Persistent Dermatological / Hair Indicators",
                description=(
                    f"You have frequently logged {symptom_str}. In clinical evaluations, persistent features of this nature "
                    "are evaluated as potential clinical signs of elevated androgens."
                ),
                evidence_details="2023 International Guideline: Clinical hyperandrogenism includes hirsutism, female pattern hair loss, and severe/treatment-resistant acne.",
                recommendation="A clinician can evaluate these signs objectively (e.g. using the modified Ferriman-Gallwey scale) and determine if biochemical testing is appropriate.",
                trigger_data={"hair_symptoms_count": len(hair_symptoms), "severe_acne_count": len(severe_acne)}
            ))

        # -------------------------------------------------------------
        # Rule 6: Metabolic & Body Measurement Observations
        # -------------------------------------------------------------
        if measurements:
            recent_measurement = measurements[-1]
            waist = recent_measurement.get("waist_cm")
            bmi = recent_measurement.get("bmi")

            if waist and waist >= 80: # Ethnic specific threshold for South Asian women
                observations.append(ClinicalObservation(
                    category="metabolic_markers",
                    observation_type="pattern_observation",
                    title="Waist Circumference Health Context",
                    description=(
                        f"Your recorded waist measurement ({waist} cm) meets or exceeds the metabolic health indicator threshold "
                        "(80 cm for South Asian women). Central adiposity is frequently associated with insulin resistance."
                    ),
                    evidence_details="WHO & International Diabetes Federation ethnic-specific metabolic guidelines.",
                    recommendation="Discuss cardiometabolic and insulin resistance screening (such as fasting glucose or lipid profiles) during your next checkup.",
                    trigger_data={"waist_cm": waist}
                ))

        # -------------------------------------------------------------
        # Rule 7: Differential Diagnosis Exclusions Reminder
        # -------------------------------------------------------------
        # If there are pattern flags, remind user of alternative causes
        has_flags = any(obs.observation_type == "follow_up_observation" for obs in observations)
        if has_flags:
            observations.append(ClinicalObservation(
                category="clinical_safety",
                observation_type="pattern_observation",
                title="Differential Diagnosis Considerations for Your Doctor",
                description=(
                    "Menstrual irregularity and androgenic symptoms can stem from several distinct endocrine conditions, "
                    "including thyroid dysfunction (hypo/hyperthyroidism), elevated prolactin (hyperprolactinemia), "
                    "or non-classic congenital adrenal hyperplasia (NCAH)."
                ),
                evidence_details="2023 International Guideline Section 2: Mandatory exclusion of mimicking endocrine pathologies prior to diagnosis.",
                recommendation="Ask your healthcare professional whether TSH, prolactin, or 17-OHP testing is indicated before assuming a diagnosis."
            ))

        return observations
