"""Evidence-Informed Clinical Rule Observation & Pattern Alignment Index (PAI) Engine

Based on:
1. International Evidence-Based Guideline for the Assessment and Management of
   Polycystic Ovary Syndrome (PCOS / PMOS), 2023 Edition (Monash University, ESHRE, ASRM, Endocrine Society).
2. WHO / Consensus Guidelines for Asian Indians on Obesity and Metabolic Syndrome (Misra et al., 2009).
3. Ashwell & Gibson (2016): Waist-to-Height Ratio (WHtR) cardiometabolic risk screening.
4. Rotterdam 2003 Consensus & Adolescent Diagnostic Guardrails.

CRITICAL INVARIANTS:
1. This engine NEVER outputs a medical diagnosis or disease probability.
2. Distinguishes normal pubertal development (adolescents <3 years post-menarche) from persistent pathology.
3. Strict diagnostic guardrails: Ultrasound and AMH are NOT recommended for PCOS diagnosis in adolescents (<8 years from menarche).
4. Decouples pelvic imaging choice from marital status: Transabdominal pelvic ultrasound (TAS) with full bladder is standard non-invasive modality; TVS requires explicit informed consent.
5. Post-pill transition guardrail: Minimum 3-6 month observation period post-contraceptive discontinuation before baseline ovulatory evaluation.
6. Differential diagnosis exclusions: Mandates clinical evaluation of TSH, Prolactin, and 17-OHP (CAH).
7. Non-stigmatizing, body-neutral terminology and mental health crisis pathway (Tele-MANAS 14416 / 988).
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
            "rule_version": "2023_international_guideline_v2.0",
            "trigger_data": self.trigger_data
        }

class ClinicalRuleEngine:
    GUIDELINE_VERSION = "2023_international_guideline_v2.0"
    GUIDELINE_CITATION = (
        "International evidence-based guideline for the assessment and management of "
        "polycystic ovary syndrome (PCOS/PMOS) 2023; Monash University."
    )

    @classmethod
    def calculate_pattern_alignment_index(
        cls,
        user_profile: Any,
        cycles: List[Dict[str, Any]],
        symptoms: List[Dict[str, Any]],
        measurements: List[Dict[str, Any]],
        lab_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates the non-diagnostic Pattern Alignment Index (PAI).
        A multi-axial mathematical concordance metric (0-100) reflecting alignment
        with international guideline criteria axes, with adolescent and contraceptive modifiers.
        """
        age = getattr(user_profile, "age", None) or 25
        menarche_age = getattr(user_profile, "menarche_age", None)
        years_post_menarche = (age - menarche_age) if (age and menarche_age) else 10
        is_adolescent = (years_post_menarche is not None and years_post_menarche < 3) or (age < 18)
        using_ocp = getattr(user_profile, "using_hormonal_contraception", False)
        contraceptive_discontinued = getattr(user_profile, "contraceptive_discontinued_date", None)

        # -------------------------------------------------------------
        # Axis 1: Ovulatory Regularity Axis (Weight: 35%)
        # -------------------------------------------------------------
        ovulatory_raw = 0.0
        ovulatory_notes = "Baseline ovulatory tracking"

        if using_ocp:
            ovulatory_raw = 0.0
            ovulatory_notes = "Ovulatory axis unassessable due to exogenous hormonal contraception."
        elif is_adolescent:
            if years_post_menarche is not None and years_post_menarche <= 1:
                ovulatory_raw = 10.0
                ovulatory_notes = "Adolescent post-menarche year 1: Menstrual variation is physiological."
            else:
                abnormal = [c for c in cycles if c.get("cycle_length_days", 28) < 21 or c.get("cycle_length_days", 28) > 45]
                ovulatory_raw = min(100.0, len(abnormal) * 40.0)
                ovulatory_notes = f"Adolescent reference (21-45 days): {len(abnormal)} cycle(s) outside range."
        else:
            # Adult
            irregular = [c for c in cycles if c.get("cycle_length_days", 28) < 21 or c.get("cycle_length_days", 28) > 35]
            prolonged = [c for c in cycles if c.get("cycle_length_days", 28) > 90]
            if prolonged:
                ovulatory_raw = 100.0
                ovulatory_notes = "Interval >90 days (secondary amenorrhea pattern)."
            elif len(irregular) >= 2:
                ovulatory_raw = 75.0
                ovulatory_notes = f"{len(irregular)} cycles outside 21-35 day reference range."
            elif len(irregular) == 1:
                ovulatory_raw = 35.0
                ovulatory_notes = "Isolated cycle irregularity."
            elif len(cycles) >= 3:
                ovulatory_raw = 10.0
                ovulatory_notes = "Consistently within 21-35 day adult reference range."
            else:
                ovulatory_raw = 20.0
                ovulatory_notes = "Limited cycle records (<3 cycles)."

        # -------------------------------------------------------------
        # Axis 2: Hyperandrogenic Features Axis (Weight: 30%)
        # -------------------------------------------------------------
        hair_syms = [s for s in symptoms if s.get("category") == "hair" and s.get("severity", 0) >= 2]
        severe_acne = [s for s in symptoms if s.get("symptom_code") in ("facial_acne", "body_acne") and s.get("severity", 0) >= 3]
        max_rvi = max([s.get("rvi_score", 0.0) or 0.0 for s in symptoms] or [0.0])

        androgenic_raw = 0.0
        if max_rvi >= 2.5 or (hair_syms and severe_acne):
            androgenic_raw = 90.0
            androgenic_notes = "Co-occurrence of prominent dermatological and hair markers."
        elif hair_syms or max_rvi >= 1.5:
            androgenic_raw = 60.0
            androgenic_notes = "Logged moderate hair growth or regrowth velocity."
        elif severe_acne:
            androgenic_raw = 50.0
            androgenic_notes = "Persistent moderate-to-severe acne."
        elif symptoms:
            androgenic_raw = 10.0
            androgenic_notes = "Mild or non-androgenic symptoms reported."
        else:
            androgenic_raw = 0.0
            androgenic_notes = "No androgenic symptoms logged."

        # -------------------------------------------------------------
        # Axis 3: South Asian Metabolic Health Context (Weight: 20%)
        # -------------------------------------------------------------
        metabolic_raw = 0.0
        metabolic_notes = "No anthropometric measurements logged."
        if measurements:
            recent_m = measurements[-1]
            bmi = recent_m.get("bmi")
            waist = recent_m.get("waist_cm")
            whtr = recent_m.get("waist_to_height_ratio")
            neck = recent_m.get("neck_circumference_cm")

            score = 10.0
            reasons = []
            # Asian-Indian BMI threshold (overweight >= 23.0, obese >= 27.5)
            if bmi and bmi >= 27.5:
                score += 50.0
                reasons.append(f"Asian-Indian BMI >= 27.5 ({bmi})")
            elif bmi and bmi >= 23.0:
                score += 30.0
                reasons.append(f"Asian-Indian BMI >= 23.0 ({bmi})")

            # Waist-to-Height Ratio (0.50 threshold)
            if whtr and whtr >= 0.55:
                score += 30.0
                reasons.append(f"WHtR >= 0.55 ({whtr})")
            elif whtr and whtr >= 0.50:
                score += 20.0
                reasons.append(f"WHtR >= 0.50 ({whtr})")
            elif waist and waist >= 80.0:
                score += 20.0
                reasons.append(f"Waist >= 80 cm ({waist} cm)")

            if neck and neck >= 34.0:
                score += 15.0
                reasons.append(f"Neck circumference >= 34 cm ({neck} cm)")

            metabolic_raw = min(100.0, score)
            metabolic_notes = "; ".join(reasons) if reasons else "Anthropometrics within standard South Asian reference ranges."

        # -------------------------------------------------------------
        # Axis 4: Biochemical & Laboratory Axis (Weight: 15%)
        # -------------------------------------------------------------
        biochemical_raw = 0.0
        biochemical_notes = "No clinical laboratory investigations recorded."
        if lab_results:
            bio_score = 10.0
            bio_reasons = []
            for lab in lab_results:
                t_name = (lab.get("test_name") or "").lower()
                val = lab.get("value", 0.0)
                if "testosterone" in t_name and val > 60.0:
                    bio_score += 40.0
                    bio_reasons.append(f"Elevated {lab.get('test_name')}")
                elif "lh" in t_name and val > 12.0:
                    bio_score += 20.0
                    bio_reasons.append("Elevated LH")
                elif "glucose" in t_name and val >= 100.0:
                    bio_score += 20.0
                    bio_reasons.append("Impaired fasting glucose")
                elif "tsh" in t_name and (val < 0.4 or val > 4.5):
                    bio_reasons.append("Abnormal TSH (differential flag)")
            biochemical_raw = min(100.0, bio_score)
            biochemical_notes = "; ".join(bio_reasons) if bio_reasons else "All logged laboratory values in reference intervals."

        # Calculate weighted composite
        w_ov = 0.35
        w_and = 0.30
        w_met = 0.20
        w_bio = 0.15

        pai_score = (
            w_ov * ovulatory_raw +
            w_and * androgenic_raw +
            w_met * metabolic_raw +
            w_bio * biochemical_raw
        )
        pai_score = round(min(100.0, max(0.0, pai_score)), 1)

        level = "Low Concordance"
        if pai_score >= 65.0:
            level = "Elevated Concordance"
        elif pai_score >= 35.0:
            level = "Moderate Concordance"

        axes = [
            {
                "axis_name": "Ovulatory Regularity",
                "weight_pct": 35.0,
                "raw_score": round(ovulatory_raw, 1),
                "weighted_contribution": round(w_ov * ovulatory_raw, 1),
                "description": ovulatory_notes
            },
            {
                "axis_name": "Hyperandrogenic Indicators",
                "weight_pct": 30.0,
                "raw_score": round(androgenic_raw, 1),
                "weighted_contribution": round(w_and * androgenic_raw, 1),
                "description": androgenic_notes
            },
            {
                "axis_name": "South Asian Metabolic Context",
                "weight_pct": 20.0,
                "raw_score": round(metabolic_raw, 1),
                "weighted_contribution": round(w_met * metabolic_raw, 1),
                "description": metabolic_notes
            },
            {
                "axis_name": "Biochemical Laboratory Markers",
                "weight_pct": 15.0,
                "raw_score": round(biochemical_raw, 1),
                "weighted_contribution": round(w_bio * biochemical_raw, 1),
                "description": biochemical_notes
            }
        ]

        data_points = (len(cycles) >= 3) + (len(symptoms) >= 3) + (len(measurements) >= 1) + (len(lab_results) >= 1)
        completeness = round((data_points / 4.0) * 100.0, 1)

        dev_mod = "Adolescent pubertal transition criteria active (<3 post-menarche years)." if is_adolescent else None
        ocp_mod = "Exogenous hormonal contraception suppresses spontaneous ovulatory axis." if using_ocp else None

        return {
            "pai_score": pai_score,
            "alignment_level": level,
            "axes": axes,
            "confidence_level": "robust" if completeness >= 75 else ("moderate" if completeness >= 50 else "low"),
            "data_completeness_pct": completeness,
            "developmental_modifier": dev_mod,
            "contraceptive_modifier": ocp_mod,
            "disclaimer": (
                "NON-DIAGNOSTIC NOTICE: The Pattern Alignment Index (PAI) is an evidence-informed "
                "mathematical concordance indicator showing the alignment of self-reported observations "
                "with published 2023 international guideline features. It is NOT a clinical diagnosis, "
                "does NOT calculate the probability of having PCOS, and must be reviewed with a qualified clinician."
            )
        }

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
        contraceptive_discontinued = getattr(user_profile, "contraceptive_discontinued_date", None)
        contraceptive_type = getattr(user_profile, "contraceptive_type", None)

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
        # Rule 2: Hormonal Contraception & Post-Pill Transition Guardrail
        # -------------------------------------------------------------
        if using_hormonal_contraception:
            method_desc = f" ({contraceptive_type})" if contraceptive_type else ""
            observations.append(ClinicalObservation(
                category="post_pill_transition",
                observation_type="pattern_observation",
                title=f"Active Hormonal Contraception Guardrail{method_desc}",
                description=(
                    "Bleeding episodes experienced while using hormonal contraception are withdrawal "
                    "bleeds rather than spontaneous ovulatory menstrual cycles. Baseline ovulatory status "
                    "and hormonal markers cannot be accurately assessed during contraceptive use."
                ),
                evidence_details="2023 International Guideline: Exogenous hormones suppress the hypothalamic-pituitary-ovarian axis.",
                recommendation="Do NOT stop prescribed medication on your own. Discuss baseline evaluation timing with your doctor.",
                trigger_data={"using_hormonal_contraception": True, "contraceptive_type": contraceptive_type}
            ))
        elif contraceptive_discontinued:
            observations.append(ClinicalObservation(
                category="post_pill_transition",
                observation_type="pattern_observation",
                title="Post-Contraceptive Washout Window (3-6 Months)",
                description=(
                    "You noted recent discontinuation of hormonal contraception. The ovulatory axis often takes "
                    "3 to 6 months to re-establish regular spontaneous cycles. Cycle irregularity during this period "
                    "must not be prematurely attributed to PCOS."
                ),
                evidence_details="ACOG / 2023 Guidelines: Post-pill amenorrhea and transient follicular dysregulation are common for up to 6 months.",
                recommendation="Monitor your cycles gently over the next 3 to 6 cycles before undertaking diagnostic hormone evaluations.",
                trigger_data={"discontinued_date": contraceptive_discontinued}
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
                    recommendation="Maintain a gentle tracking record without anxiety. Discuss severe pain or bleeding >7 days with a pediatrician or gynecologist."
                ))
            elif years_post_menarche is not None and 1 < years_post_menarche < 3:
                abnormal_cycles = [c for c in cycles if c.get("cycle_length_days", 28) < 21 or c.get("cycle_length_days", 28) > 45]
                if abnormal_cycles:
                    observations.append(ClinicalObservation(
                        category="cycle_regularity",
                        observation_type="follow_up_observation",
                        title="Cycles Outside 21-45 Day Adolescent Reference Range",
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
                    "International clinical consensus strictly advises against using pelvic ultrasound or AMH (Anti-Müllerian Hormone) "
                    "as diagnostic tools in adolescents (<8 years from menarche), because multi-follicular ovaries and pubertal AMH elevation are normal at this age."
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
        # Rule 5: Clinical Hyperandrogenism & Regrowth Velocity (RVI)
        # -------------------------------------------------------------
        hair_symptoms = [s for s in symptoms if s.get("category") == "hair" and s.get("severity", 0) >= 2]
        severe_acne = [s for s in symptoms if s.get("symptom_code") in ("facial_acne", "body_acne") and s.get("severity", 0) >= 3]
        rvi_entries = [s for s in symptoms if s.get("rvi_score") and s.get("rvi_score", 0) >= 2.0]

        if hair_symptoms or severe_acne or rvi_entries:
            details = []
            if hair_symptoms:
                details.append("unwanted hair growth or thinning")
            if severe_acne:
                details.append("persistent acne")
            if rvi_entries:
                details.append("elevated Regrowth Velocity Index accounting for cosmetic grooming")
            
            symptom_str = " and ".join(details)
            observations.append(ClinicalObservation(
                category="hyperandrogenism_signs",
                observation_type="pattern_observation",
                title="Dermatological & Androgenic Indicator Observations",
                description=(
                    f"You have logged {symptom_str}. In clinical evaluations, persistent features of this nature "
                    "are evaluated as potential clinical signs of elevated androgens."
                ),
                evidence_details="2023 International Guideline: Clinical hyperandrogenism includes hirsutism, female pattern hair loss, and treatment-resistant acne.",
                recommendation="A clinician can evaluate these signs objectively (e.g. using the modified Ferriman-Gallwey scale) and determine if biochemical testing is appropriate.",
                trigger_data={"hair_symptoms_count": len(hair_symptoms), "severe_acne_count": len(severe_acne)}
            ))

        # -------------------------------------------------------------
        # Rule 6: South Asian Metabolic Health Context & Thin-Fat Risk
        # -------------------------------------------------------------
        if measurements:
            recent_measurement = measurements[-1]
            waist = recent_measurement.get("waist_cm")
            bmi = recent_measurement.get("bmi")
            whtr = recent_measurement.get("waist_to_height_ratio")
            neck = recent_measurement.get("neck_circumference_cm")
            slump = recent_measurement.get("postprandial_slump_score")

            met_alerts = []
            # Asian-Indian BMI Threshold (overweight >= 23.0)
            if bmi and bmi >= 23.0:
                cat_name = "increased risk (overweight)" if bmi < 27.5 else "high cardiometabolic risk (obese)"
                met_alerts.append(f"Asian-Indian BMI of {bmi} indicates {cat_name} by WHO/ICMR consensus guidelines")

            # Waist-to-Height Ratio (WHtR)
            if whtr and whtr >= 0.50:
                met_alerts.append(f"Waist-to-Height Ratio ({whtr}) meets or exceeds the 0.50 cardiometabolic screening threshold")
            elif waist and waist >= 80:
                met_alerts.append(f"Waist circumference ({waist} cm) meets or exceeds the 80 cm South Asian female threshold")

            if neck and neck >= 34.0:
                met_alerts.append(f"Neck circumference ({neck} cm) meets or exceeds the 34 cm upper-body adiposity screening cutoff")

            if met_alerts:
                observations.append(ClinicalObservation(
                    category="metabolic_markers",
                    observation_type="pattern_observation",
                    title="South Asian Metabolic Health Indicators",
                    description=(
                        "Your anthropometric markers indicate: " + "; ".join(met_alerts) + ". "
                        "The 'thin-fat' phenotype common in South Asian populations confers increased cardiometabolic "
                        "and insulin resistance risk even at lower absolute body weights."
                    ),
                    evidence_details="WHO & Consensus Guidelines for Asian Indians; Ashwell & Gibson (2016) WHtR framework.",
                    recommendation="Discuss cardiometabolic and insulin resistance screening (e.g., fasting glucose, lipid profile) during your next clinical checkup.",
                    trigger_data={"bmi": bmi, "waist_cm": waist, "whtr": whtr, "neck_cm": neck}
                ))

            if slump and slump >= 4:
                observations.append(ClinicalObservation(
                    category="metabolic_markers",
                    observation_type="pattern_observation",
                    title="Postprandial Energy Slump Observations",
                    description=(
                        f"You noted frequent severe post-meal energy slumps (score {slump}/5). While meal composition and sleep "
                        "significantly impact postprandial fatigue, severe slumps can sometimes correlate with reactive hypoglycemia."
                    ),
                    evidence_details="Exploratory lifestyle observation. Subjective fatigue cannot diagnose insulin resistance.",
                    recommendation="Maintain balanced meals with fiber and protein. Mention post-meal fatigue to your doctor if undergoing metabolic testing.",
                    trigger_data={"postprandial_slump_score": slump}
                ))

        # -------------------------------------------------------------
        # Rule 7: Phase-Locked Lab Scheduling & Non-Stigmatizing Ultrasound Guardrail
        # -------------------------------------------------------------
        observations.append(ClinicalObservation(
            category="clinical_safety",
            observation_type="pattern_observation",
            title="Investigation Timing & Pelvic Imaging Guardrails",
            description=(
                "If your clinician recommends blood testing, hormonal investigations (Total/Free Testosterone, LH, FSH, Estradiol, 17-OHP) "
                "should ideally be drawn on Days 2–4 of a spontaneous early follicular phase for accurate interpretation. "
                "For pelvic imaging, Transabdominal Ultrasound (TAS) with a full bladder is the standard non-invasive approach for young women; "
                "Transvaginal Ultrasound (TVS) is an alternative requiring explicit informed consent and is never dictated by marital status."
            ),
            evidence_details="2023 International Guideline Section on Diagnostic Investigations: Timing protocols and non-invasive imaging preference.",
            recommendation="Confirm the optimal cycle timing and imaging modality with your treating clinician."
        ))

        # -------------------------------------------------------------
        # Rule 8: Differential Diagnosis Exclusions Reminder
        # -------------------------------------------------------------
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

        # -------------------------------------------------------------
        # Rule 9: Mental Health, Coping & Crisis Support Pathway
        # -------------------------------------------------------------
        mood_severe = [s for s in symptoms if s.get("category") == "wellbeing" and s.get("severity", 0) >= 4]
        if mood_severe:
            observations.append(ClinicalObservation(
                category="psychological_wellbeing",
                observation_type="pattern_observation",
                title="Emotional Wellbeing Support & Confidential Helplines",
                description=(
                    "Hormonal fluctuations and chronic health concerns can significantly impact emotional wellbeing, mood, and anxiety. "
                    "If you are feeling overwhelmed, hopeless, or in acute distress, confidential professional support is freely available 24/7."
                ),
                evidence_details="2023 International Guideline Section on Emotional Wellbeing: Mandatory psychological screening and crisis support pathways.",
                recommendation="In India, call the national Tele-MANAS mental health helpline at 14416 (or 1800-891-4416). Internationally, dial 988 or your local emergency line."
            ))

        return observations
