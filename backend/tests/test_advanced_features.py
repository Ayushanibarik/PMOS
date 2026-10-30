import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.services.cycle_analytics import CycleAnalyticsService
from app.services.vernacular_nlp import VernacularNlpService
from app.services.rvi_calculator import RviCalculatorService
from app.services.bayesian_recalibration import BayesianRecalibrationService
from app.services.lab_scheduling import LabSchedulingService
from app.clinical_rules.engine import ClinicalRuleEngine

client = TestClient(app)

def get_patient_token():
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

# -------------------------------------------------------------
# 1. Category 1: Beta Drift & Phase-Triggered Micro Checkpoints (U01, U02)
# -------------------------------------------------------------
def test_beta_drift_mathematical_calculation():
    # 5 cycles with progressive lengthening (+2 days per cycle: 28, 30, 32, 34, 36)
    lengths = [28, 30, 32, 34, 36]
    drift = CycleAnalyticsService.calculate_beta_drift(lengths)

    assert drift["beta_drift_slope"] == 2.0
    assert drift["trend_direction"] == "lengthening"
    assert drift["confidence_level"] == "high"
    assert drift["cycles_evaluated"] == 5
    assert "anovulation" in drift["scientific_disclaimer"].lower()

    # Stable cycles (28, 28, 29, 28)
    stable_drift = CycleAnalyticsService.calculate_beta_drift([28, 28, 29, 28])
    assert stable_drift["trend_direction"] == "stable"

    # Insufficient cycles (<3)
    sparse_drift = CycleAnalyticsService.calculate_beta_drift([28, 30])
    assert sparse_drift["trend_direction"] == "insufficient_data"

def test_phase_triggered_checkpoints():
    # Flow onset (Day 2)
    cp_onset = CycleAnalyticsService.get_phase_checkpoint(
        last_period_date_str="2026-10-29",
        median_cycle_length=28.0,
        current_date=date(2026, 10, 30)
    )
    assert cp_onset["checkpoint_active"] is True
    assert cp_onset["checkpoint_type"] == "menstrual_flow"
    assert "Checkpoint 1" in cp_onset["checkpoint_title"]

    # Mid-cycle window (Day 14)
    cp_mid = CycleAnalyticsService.get_phase_checkpoint(
        last_period_date_str="2026-10-16",
        median_cycle_length=28.0,
        current_date=date(2026, 10, 30)
    )
    assert cp_mid["checkpoint_active"] is True
    assert cp_mid["checkpoint_type"] == "mid_cycle"
    assert "not confirm ovulation" in cp_mid["disclaimer"].lower()

    # Luteal phase (Day 24)
    cp_luteal = CycleAnalyticsService.get_phase_checkpoint(
        last_period_date_str="2026-10-06",
        median_cycle_length=28.0,
        current_date=date(2026, 10, 30)
    )
    assert cp_luteal["checkpoint_active"] is True
    assert cp_luteal["checkpoint_type"] == "luteal_phase"
    assert "Checkpoint 3" in cp_luteal["checkpoint_title"]

# -------------------------------------------------------------
# 2. Category 2 & 11: Zero-Hardware Smartphone rPPG & Edge Privacy (U03, U14)
# -------------------------------------------------------------
def test_rppg_biomarker_submission_and_quality_guardrail():
    token = get_patient_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Valid telemetry (SQI >= 0.60)
    res_valid = client.post("/api/v1/measurements/rppg-biomarker", headers=headers, json={
        "date": "2026-10-30",
        "resting_heart_rate": 74,
        "rmssd_ms": 42.5,
        "signal_quality_sqi": 0.88,
        "duration_seconds": 30
    })
    assert res_valid.status_code == 201
    data = res_valid.json()
    assert data["rppg_hrv_rmssd"] == 42.5
    assert data["data_source"] == "smartphone_rppg_camera"

    # Motion-artifact corrupted signal (SQI < 0.60) -> Must be rejected
    res_invalid = client.post("/api/v1/measurements/rppg-biomarker", headers=headers, json={
        "date": "2026-10-30",
        "resting_heart_rate": 110,
        "rmssd_ms": 12.0,
        "signal_quality_sqi": 0.42,
        "duration_seconds": 30
    })
    assert res_invalid.status_code == 422
    assert "acceptable threshold" in res_invalid.json()["detail"].lower()

# -------------------------------------------------------------
# 3. Category 3: Melanin-Aware CV & Regrowth Velocity Index (U04)
# -------------------------------------------------------------
def test_rvi_calculation_and_cosmetic_grooming_compensation():
    # Hair waxing with 14 days elapsed, observed severity 3
    rvi_wax = RviCalculatorService.compute_rvi(
        observed_severity=3,
        grooming_modality="waxing",
        days_since_grooming=14,
        ita_angle=22.0
    )
    assert rvi_wax["modality_coefficient"] == 2.5
    assert rvi_wax["growth_velocity_category"] == "baseline"
    assert "Tan" in rvi_wax["ita_skin_tone_category"]

    # Hair shaving with 1 day elapsed, observed severity 4 -> elevated
    rvi_shave = RviCalculatorService.compute_rvi(
        observed_severity=4,
        grooming_modality="shaving",
        days_since_grooming=1
    )
    assert rvi_shave["rvi_score"] == 4.0
    assert rvi_shave["growth_velocity_category"] == "elevated"

# -------------------------------------------------------------
# 4. Category 4: South Asian Metabolic Health & Thin-Fat Context (U05)
# -------------------------------------------------------------
def test_south_asian_metabolic_proxies():
    token = get_patient_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Asian Indian BMI >= 23.0 and WHtR >= 0.50
    res = client.post("/api/v1/measurements", headers=headers, json={
        "date": "2026-10-30",
        "weight_kg": 64.0,
        "height_cm": 160.0,  # BMI = 25.0 -> increased_risk for Asian Indian
        "waist_cm": 84.0,    # WHtR = 84/160 = 0.525 -> increased risk
        "neck_circumference_cm": 35.0, # >=34 cm -> risk flag
        "postprandial_slump_score": 4
    })
    assert res.status_code == 201
    data = res.json()
    assert data["bmi"] == 25.0
    assert data["asian_indian_risk_category"] == "increased_risk"
    assert data["waist_to_height_ratio"] in (0.52, 0.53)
    assert data["neck_circumference_cm"] == 35.0
    assert data["postprandial_slump_score"] == 4

# -------------------------------------------------------------
# 5. Category 5 & 12: Adolescent Gynecological Age & Post-Pill Guardrails (U06, U15)
# -------------------------------------------------------------
def test_adolescent_puberty_stage_and_post_pill_guardrails():
    class MockProfile:
        age = 15
        menarche_age = 14  # Gynecological age = 1 year
        is_under_18 = True
        using_hormonal_contraception = False
        contraceptive_discontinued_date = None
        contraceptive_type = None

    obs = ClinicalRuleEngine.evaluate(
        user_profile=MockProfile(),
        cycles=[{"cycle_length_days": 42}, {"cycle_length_days": 38}],
        symptoms=[],
        measurements=[],
        lab_results=[]
    )
    # Check that adolescent pubertal transition rule fired
    categories = [o.category for o in obs]
    assert "adolescent_guidance" in categories
    # Check that ultrasound & AMH guardrail is present
    titles = [o.title for o in obs]
    assert any("Adolescent Diagnostic Guardrail (Ultrasound & AMH)" in t for t in titles)

    # Post-pill discontinuation context
    class MockPostPillProfile:
        age = 26
        menarche_age = 13
        is_under_18 = False
        using_hormonal_contraception = False
        contraceptive_discontinued_date = "2026-08-01"
        contraceptive_type = "combined_oral_pill"

    obs_post_pill = ClinicalRuleEngine.evaluate(
        user_profile=MockPostPillProfile(),
        cycles=[],
        symptoms=[],
        measurements=[],
        lab_results=[]
    )
    assert any("Post-Contraceptive Washout Window" in o.title for o in obs_post_pill)

# -------------------------------------------------------------
# 6. Category 6: Non-Diagnostic Pattern Alignment Index (PAI) (U07)
# -------------------------------------------------------------
def test_pattern_alignment_index_calculation():
    class MockAdultProfile:
        age = 27
        menarche_age = 13
        is_under_18 = False
        using_hormonal_contraception = False
        contraceptive_discontinued_date = None

    cycles = [{"cycle_length_days": 44}, {"cycle_length_days": 52}, {"cycle_length_days": 39}]
    symptoms = [{"category": "hair", "symptom_code": "excess_facial_hair", "severity": 3, "rvi_score": 2.6}]
    measurements = [{"bmi": 24.5, "waist_cm": 83.0, "waist_to_height_ratio": 0.52, "neck_circumference_cm": 34.5}]
    labs = [{"test_name": "Total Testosterone", "value": 72.0}]

    pai = ClinicalRuleEngine.calculate_pattern_alignment_index(
        user_profile=MockAdultProfile(),
        cycles=cycles,
        symptoms=symptoms,
        measurements=measurements,
        lab_results=labs
    )
    assert pai["pai_score"] > 50.0
    assert len(pai["axes"]) == 4
    assert "NON-DIAGNOSTIC NOTICE" in pai["disclaimer"]

# -------------------------------------------------------------
# 7. Category 7: Vernacular Voice NLP & ASHA Camp Mode (U08)
# -------------------------------------------------------------
def test_vernacular_voice_nlp():
    # Hindi phrase with acne and delayed periods
    hi_text = "मुझे बहुत मुँहासे हो रहे हैं और पीरियड्स नहीं आ रहे"
    parsed_hi = VernacularNlpService.extract_concepts(hi_text, default_lang="hi")
    assert parsed_hi["detected_language"] == "hi"
    codes = [c["symptom_code"] for c in parsed_hi["concepts"]]
    assert "facial_acne" in codes
    assert "irregular_cycles" in codes
    assert parsed_hi["requires_user_confirmation"] is True

    # Tamil phrase with pelvic pain
    ta_text = "வயிற்று வலி அதிகம் இருக்கு"
    parsed_ta = VernacularNlpService.extract_concepts(ta_text, default_lang="ta")
    assert parsed_ta["detected_language"] == "ta"
    assert any(c["symptom_code"] == "menstrual_cramps" for c in parsed_ta["concepts"])

    # Negation handling: "कोई दर्द नहीं है"
    neg_text = "पेट में कोई दर्द नहीं है"
    parsed_neg = VernacularNlpService.extract_concepts(neg_text, default_lang="hi")
    assert any(c["is_negated"] is True for c in parsed_neg["concepts"])

def test_asha_camp_mode_data_isolation():
    token = get_patient_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/clinical-records/asha/camp-intake", headers=headers, json={
        "camp_location": "Rampur Primary Health Sub-Centre",
        "camp_date": "2026-10-30",
        "age": 22,
        "menarche_age": 13,
        "cycle_regularity": "irregular",
        "symptoms_reported": ["irregular_cycles", "facial_acne"],
        "waist_cm": 82.0,
        "height_cm": 158.0,
        "weight_kg": 62.0
    })
    assert res.status_code == 201
    data = res.json()
    assert "CAMP-" in data["anonymous_patient_token"]
    assert data["asian_indian_risk_flag"] is True

# -------------------------------------------------------------
# 8. Category 8: Phase-Locked Labs & Bayesian Recalibration (U09, U10, U11)
# -------------------------------------------------------------
def test_phase_locked_lab_scheduling():
    schedule = LabSchedulingService.generate_recommended_schedule(
        last_period_date_str="2026-10-25",
        median_cycle_length=28.0,
        user_age=24,
        years_post_menarche=11
    )
    categories = [s["test_category"] for s in schedule]
    assert "follicular_day_2_to_4" in categories
    assert "mid_luteal_progesterone" in categories
    assert "differential_exclusion" in categories
    assert "pelvic_ultrasound" in categories

    ultrasound = next(s for s in schedule if s["test_category"] == "pelvic_ultrasound")
    assert "marital status" in ultrasound["imaging_guidance"].lower()

def test_bayesian_closed_loop_recalibration():
    # Prior PAI score 55.0% -> Clinician confirms PCOS -> Posterior should increase
    recal_confirmed = BayesianRecalibrationService.calculate_recalibration(
        prior_score=55.0,
        diagnosis_status="confirmed_pcos"
    )
    assert recal_confirmed["posterior_alignment_score"] > 75.0
    assert recal_confirmed["likelihood_ratio"] == 4.0

    # Prior PAI score 65.0% -> Clinician confirms Hypothyroidism rule-out -> Posterior decreases
    recal_ruled_out = BayesianRecalibrationService.calculate_recalibration(
        prior_score=65.0,
        diagnosis_status="differential_identified",
        differential_diagnosis="hypothyroidism"
    )
    assert recal_ruled_out["posterior_alignment_score"] < 30.0
    assert recal_ruled_out["likelihood_ratio"] <= 0.20
