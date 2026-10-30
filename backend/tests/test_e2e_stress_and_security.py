import pytest
from fastapi.testclient import TestClient
from app.main import app
import secrets
import concurrent.futures

client = TestClient(app)

def test_auth_boundary_and_invalid_inputs():
    """Verify input validation on registration and authentication endpoints."""
    # 1. Empty email / password
    res = client.post("/api/v1/auth/register", json={"email": "", "password": "", "full_name": ""})
    assert res.status_code in (400, 422)

    # 2. Invalid email format
    res = client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "Password123!",
        "full_name": "Test User"
    })
    assert res.status_code in (400, 422)

    # 3. Short password
    res = client.post("/api/v1/auth/register", json={
        "email": f"test_{secrets.token_hex(4)}@example.com",
        "password": "123",
        "full_name": "Test User"
    })
    assert res.status_code in (400, 422)

    # 4. Login with non-existent user
    res = client.post("/api/v1/auth/login", json={"email": "nonexistent@example.com", "password": "wrong"})
    assert res.status_code in (400, 401)

def test_tenant_data_isolation():
    """Verify Patient A cannot view or tamper with Patient B's records."""
    email_a = f"patient_a_{secrets.token_hex(4)}@example.com"
    email_b = f"patient_b_{secrets.token_hex(4)}@example.com"
    password = "SecurePassword123!"

    # Register Patient A
    reg_a = client.post("/api/v1/auth/register", json={"email": email_a, "password": password, "full_name": "Patient A"})
    assert reg_a.status_code == 201
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Patient B
    reg_b = client.post("/api/v1/auth/register", json={"email": email_b, "password": password, "full_name": "Patient B"})
    assert reg_b.status_code == 201
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Patient A logs a period
    p_a = client.post("/api/v1/cycles", json={
        "start_date": "2026-09-01",
        "end_date": "2026-09-05",
        "flow_intensity": "medium"
    }, headers=headers_a)
    assert p_a.status_code == 201
    period_a_id = p_a.json()["id"]

    # Patient B fetches periods - must NOT see Patient A's period
    p_b_list = client.get("/api/v1/cycles", headers=headers_b)
    assert p_b_list.status_code == 200
    periods_b = p_b_list.json()
    assert not any(p["id"] == period_a_id for p in periods_b)

    # Patient B attempts to delete Patient A's period directly
    del_res = client.delete(f"/api/v1/cycles/{period_a_id}", headers=headers_b)
    assert del_res.status_code in (403, 404)

def test_tampered_and_invalid_jwt():
    """Verify server rejects fake, tampered, or malformed JWT tokens."""
    # 1. Completely random string
    res = client.get("/api/v1/patients/me", headers={"Authorization": "Bearer not-a-real-jwt"})
    assert res.status_code in (401, 403)

    # 2. Valid token structure with altered signature
    valid_token = client.post("/api/v1/auth/register", json={
        "email": f"jwt_test_{secrets.token_hex(4)}@example.com",
        "password": "Password123!",
        "full_name": "JWT User"
    }).json()["access_token"]
    
    parts = valid_token.split(".")
    tampered_token = f"{parts[0]}.{parts[1]}.tampered_signature"
    res = client.get("/api/v1/patients/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res.status_code in (401, 403)

def test_boundary_measurements_and_extreme_values():
    """Verify measurement endpoints handle boundary conditions safely."""
    email = f"boundary_{secrets.token_hex(4)}@example.com"
    token = client.post("/api/v1/auth/register", json={
        "email": email, "password": "Password123!", "full_name": "Boundary User"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Negative weight / extreme height
    res = client.post("/api/v1/measurements", json={
        "date": "2026-10-01",
        "weight_kg": -50.0,
        "height_cm": 160.0
    }, headers=headers)
    # Even if accepted at boundary, BMI calculation must not divide by zero or crash
    if res.status_code == 200:
        data = res.json()
        assert data["weight_kg"] is not None

    # Zero height (prevent ZeroDivisionError)
    res = client.post("/api/v1/measurements", json={
        "date": "2026-10-02",
        "weight_kg": 60.0,
        "height_cm": 0.0
    }, headers=headers)
    # Should either reject (422) or handle safely with None BMI
    if res.status_code == 200:
        assert res.json().get("bmi") is None

def test_missing_data_resilience_in_analytics():
    """Verify analytics and predictions handle 0 and 1 cycle gracefully without crashing."""
    email = f"fresh_user_{secrets.token_hex(4)}@example.com"
    token = client.post("/api/v1/auth/register", json={
        "email": email, "password": "Password123!", "full_name": "Fresh User"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 0 cycles
    res0 = client.get("/api/v1/cycles/analytics", headers=headers)
    assert res0.status_code == 200
    assert res0.json()["has_sufficient_data"] is False
    assert res0.json()["average_cycle_length"] is None

    # 1 cycle logged
    client.post("/api/v1/cycles", json={
        "start_date": "2026-08-01",
        "end_date": "2026-08-05"
    }, headers=headers)

    res1 = client.get("/api/v1/cycles/analytics", headers=headers)
    assert res1.status_code == 200
    assert res1.json()["has_sufficient_data"] is False
    assert res1.json()["total_recorded_cycles"] == 0  # 1 period = 0 completed intervals

def test_concurrent_period_logging():
    """Verify concurrent requests do not corrupt state or crash database transactions."""
    email = f"concurrent_{secrets.token_hex(4)}@example.com"
    token = client.post("/api/v1/auth/register", json={
        "email": email, "password": "Password123!", "full_name": "Concurrent User"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    def log_period(month):
        return client.post("/api/v1/cycles", json={
            "start_date": f"2026-0{month}-01",
            "end_date": f"2026-0{month}-05",
            "flow_intensity": "medium"
        }, headers=headers)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(log_period, m) for m in range(1, 6)]
        results = [f.result() for f in futures]

    assert all(r.status_code == 201 for r in results)
    periods_list = client.get("/api/v1/cycles", headers=headers).json()
    assert len(periods_list) == 5

def test_revoked_clinician_access_enforcement():
    """Verify an expired or revoked sharing permission immediately denies clinician access."""
    patient_email = f"p_share_{secrets.token_hex(4)}@example.com"
    clinician_email = f"c_share_{secrets.token_hex(4)}@example.com"
    pw = "Password123!"

    # Patient
    p_token = client.post("/api/v1/auth/register", json={
        "email": patient_email, "password": pw, "full_name": "Sharing Patient"
    }).json()["access_token"]
    p_headers = {"Authorization": f"Bearer {p_token}"}

    # Clinician
    c_res = client.post("/api/v1/auth/register", json={
        "email": clinician_email, "password": pw, "full_name": "Dr. Clinician", "role": "clinician"
    })
    c_token = c_res.json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Patient generates sharing code via clinicians API
    code_res = client.post("/api/v1/clinicians/invite", json={
        "sharing_scope": "full_record",
        "duration_days": 7
    }, headers=p_headers)
    assert code_res.status_code == 200
    access_code = code_res.json()["access_code"]
    permission_id = code_res.json()["id"]

    # Clinician redeems code
    redeem_res = client.post(f"/api/v1/clinicians/redeem-invite?access_code={access_code}", headers=c_headers)
    assert redeem_res.status_code == 200

    # Patient revokes permission
    revoke_res = client.post(f"/api/v1/clinicians/revoke-permission/{permission_id}", headers=p_headers)
    assert revoke_res.status_code == 200

    # Clinician attempts to access record again after revocation
    check_patients = client.get("/api/v1/clinicians/patients", headers=c_headers).json()
    assert not any(p["patient_id"] == code_res.json()["patient_id"] for p in check_patients)
