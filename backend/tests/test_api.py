import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine, SessionLocal
from app.models import User, UserProfile, UserRole, MenstrualPeriod
from app.clinical_rules.engine import ClinicalRuleEngine
from app.services.cycle_analytics import CycleAnalyticsService

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "CycleAware"

def test_auth_and_login_flow():
    # 1. Login with demo patient
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "patient@cycleaware.local"
    assert data["role"] == "patient"
    token = data["access_token"]

    # 2. Access /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "patient@cycleaware.local"

def test_cycle_analytics_and_predictions():
    # Login as patient
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Retrieve analytics
    res_analytics = client.get("/api/v1/cycles/analytics", headers=headers)
    assert res_analytics.status_code == 200
    analytics = res_analytics.json()
    assert analytics["total_recorded_cycles"] >= 5
    assert analytics["average_cycle_length"] is not None
    assert analytics["has_sufficient_data"] is True
    assert analytics["prediction"]["predicted_start_date"] is not None
    assert analytics["prediction"]["confidence_level"] in ["high", "medium", "low"]

def test_insufficient_history_prediction_safety():
    """Verify that fewer than 3 cycles NEVER fabricates a prediction date."""
    periods = [
        MenstrualPeriod(id="1", user_id="test", start_date="2026-01-01", end_date="2026-01-05"),
        MenstrualPeriod(id="2", user_id="test", start_date="2026-02-01", end_date="2026-02-05")
    ]
    analytics = CycleAnalyticsService.compute_analytics(periods, user_age=25, menarche_age=13)
    assert analytics["total_recorded_cycles"] == 1
    assert analytics["has_sufficient_data"] is False
    assert analytics["prediction"]["predicted_start_date"] is None
    assert analytics["prediction"]["confidence_level"] == "insufficient_data"

def test_adolescent_safety_rule_engine():
    """Verify that adolescent rules protect against false PCOS diagnosis and inappropriate ultrasound."""
    class MockAdolescentProfile:
        age = 15
        menarche_age = 14
        is_under_18 = True
        using_hormonal_contraception = False

    cycles = [{"cycle_length_days": 42}, {"cycle_length_days": 38}]
    symptoms = [{"symptom_code": "facial_acne", "symptom_name": "Facial Acne", "category": "skin", "severity": 2}]
    measurements = []
    labs = []

    obs = ClinicalRuleEngine.evaluate(
        user_profile=MockAdolescentProfile(),
        cycles=cycles,
        symptoms=symptoms,
        measurements=measurements,
        lab_results=labs
    )

    # Must contain adolescent pubertal maturation note and ultrasound caution
    categories = [o.category for o in obs]
    assert "adolescent_guidance" in categories
    
    titles = [o.title for o in obs]
    assert any("Normal Pubertal Maturation Window" in t for t in titles)
    assert any("Adolescent Diagnostic Guardrail" in t for t in titles)

def test_clinical_observations_rule_engine():
    # Login as patient
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_obs = client.get("/api/v1/observations", headers=headers)
    assert res_obs.status_code == 200
    obs_data = res_obs.json()
    assert obs_data["total_observations"] > 0
    assert obs_data["has_irregular_cycles"] is True
    assert "NOT represent a medical diagnosis" in obs_data["disclaimer"]

def test_clinician_portal_authorization():
    # Login as doctor
    res_doc = client.post("/api/v1/auth/login", json={
        "email": "doctor@cycleaware.local",
        "password": "DemoDoctor123!"
    })
    token_doc = res_doc.json()["access_token"]
    headers_doc = {"Authorization": f"Bearer {token_doc}"}

    # View authorized patients
    res_pts = client.get("/api/v1/clinicians/patients", headers=headers_doc)
    assert res_pts.status_code == 200
    pts = res_pts.json()
    assert len(pts) >= 1
    patient_id = pts[0]["patient_id"]

    # Deep-dive into patient detail
    res_det = client.get(f"/api/v1/clinicians/patients/{patient_id}", headers=headers_doc)
    assert res_det.status_code == 200
    det = res_det.json()
    assert "patient" in det
    assert "analytics" in det
    assert len(det["clinician_notes"]) >= 1

def test_privacy_data_export():
    # Login as patient
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_exp = client.post("/api/v1/privacy/export", headers=headers)
    assert res_exp.status_code == 200
    data = res_exp.json()
    assert data["metadata"]["compliance"] == "India DPDP Act 2023 Right of Access & Data Portability"
    assert len(data["menstrual_periods"]) >= 5

def test_model_registry_and_experimental_inference():
    # Login as patient
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@cycleaware.local",
        "password": "DemoPatient123!"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch registry
    res_reg = client.get("/api/v1/ml/models", headers=headers)
    assert res_reg.status_code == 200
    reg = res_reg.json()
    assert "models" in reg
    assert len(reg["models"]) >= 1
    model_card = reg["models"][0]
    assert model_card["model_id"] == "EXP-RF-001"
    assert model_card["is_enabled_for_clinical_use"] is False

    # 2. Experimental inference
    res_inf = client.post("/api/v1/ml/experimental-inference", headers=headers, json={
        "age": 26.0,
        "years_post_menarche": 13.0,
        "mean_cycle_length": 42.0,
        "cycle_length_std": 8.0,
        "skipped_cycles_per_year": 3,
        "hirsutism_score": 3,
        "acne_severity": 3,
        "hair_thinning_severity": 2,
        "bmi": 26.5,
        "waist_cm": 84.0,
        "fasting_glucose": 95.0
    })
    assert res_inf.status_code == 200
    inf_data = res_inf.json()
    assert "experimental_score" in inf_data
    assert "EXPERIMENTAL RESEARCH PROTOTYPE ONLY" in inf_data["disclaimer_banner"]
    assert len(inf_data["feature_attributions"]) == 11

def test_admin_system_health():
    # Login as admin
    res_admin = client.post("/api/v1/auth/login", json={
        "email": "admin@cycleaware.local",
        "password": "DemoAdmin123!"
    })
    token_admin = res_admin.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    res_health = client.get("/api/v1/admin/system-health", headers=headers_admin)
    assert res_health.status_code == 200
    health = res_health.json()
    assert health["status"] == "healthy"
    assert health["statistics"]["total_registered_users"] >= 3
