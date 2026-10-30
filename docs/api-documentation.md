# API Documentation (v1)

The CycleAware backend exposes RESTful endpoints with OpenAPI schema support at `/docs`.

All authenticated requests require the `Authorization: Bearer <access_token>` header.

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account and initialize profile | No |
| `POST` | `/auth/login` | Authenticate with email/password; returns JWT | No |
| `GET` | `/auth/me` | Fetch currently authenticated user and role | Yes |
| `POST` | `/auth/logout` | Client session termination | Yes |

---

## 2. Patient Profile & Consents (`/api/v1/patients`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/patients/me` | Fetch detailed patient profile | Yes (Patient) |
| `PATCH` | `/patients/me` | Update age, menarche, onboarding flags | Yes (Patient) |
| `GET` | `/patients/me/consents` | List current consent states | Yes (Patient) |
| `POST` | `/patients/me/consents` | Update granular consent preferences | Yes (Patient) |
| `GET` | `/patients/me/timeline` | Unified chronological health timeline | Yes (Patient) |

---

## 3. Menstrual Cycles (`/api/v1/cycles`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/cycles` | List user's logged period entries | Yes (Patient) |
| `POST` | `/cycles` | Log a new menstrual period entry | Yes (Patient) |
| `GET` | `/cycles/{id}` | Retrieve specific period entry | Yes (Patient) |
| `PATCH` | `/cycles/{id}` | Update period dates or flow intensity | Yes (Patient) |
| `DELETE` | `/cycles/{id}` | Remove period entry | Yes (Patient) |
| `GET` | `/cycles/analytics` | Statistical summaries, length variation, predictions | Yes (Patient) |

---

## 4. Symptoms (`/api/v1/symptoms`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/symptoms/catalogue` | List standardized symptom catalogue | No |
| `GET` | `/symptoms` | List logged symptom entries | Yes (Patient) |
| `POST` | `/symptoms` | Log new symptom entry (severity 0-5) | Yes (Patient) |
| `GET` | `/symptoms/trends` | Aggregated frequencies and severity trends | Yes (Patient) |
| `DELETE` | `/symptoms/{id}` | Remove symptom entry | Yes (Patient) |

---

## 5. Measurements & Labs (`/api/v1/measurements`, `/api/v1/clinical-records`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/measurements` | List physical measurements | Yes (Patient) |
| `POST` | `/measurements` | Log weight, waist, BP, sleep | Yes (Patient) |
| `GET` | `/clinical-records/labs` | List laboratory test records | Yes (Patient) |
| `POST` | `/clinical-records/labs` | Add structured lab test record | Yes (Patient) |
| `POST` | `/clinical-records/upload` | Upload PDF/image diagnostic report | Yes (Patient) |
| `GET` | `/clinical-records/documents` | List uploaded private documents | Yes (Patient) |

---

## 6. Observations & Reports (`/api/v1/observations`, `/api/v1/reports`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/observations` | Evaluate 2023 international clinical guidelines | Yes (Patient) |
| `GET` | `/reports/export/csv` | Download structured CSV export package | Yes (Patient) |
| `GET` | `/reports/download/pdf` | Download formatted Clinical Summary PDF | Yes (Patient) |

---

## 7. Clinician Portal (`/api/v1/clinicians`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/clinicians/invite` | Patient generates time-limited access code | Yes (Patient) |
| `POST` | `/clinicians/redeem-invite` | Clinician links patient via code | Yes (Clinician) |
| `GET` | `/clinicians/patients` | List authorized patients | Yes (Clinician) |
| `GET` | `/clinicians/patients/{id}` | Deep dive into patient's records | Yes (Clinician) |
| `POST` | `/clinicians/notes` | Add consultation assessment & referral | Yes (Clinician) |

---

## 8. Privacy, Governance & ML (`/api/v1/privacy`, `/api/v1/ml`, `/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/privacy/export` | Complete JSON data principal export | Yes |
| `POST` | `/privacy/delete-account` | Permanent account and data erasure | Yes |
| `GET` | `/ml/models` | Retrieve Model Registry cards & metrics | Yes |
| `POST` | `/ml/experimental-inference` | Research inference playground with SHAP vectors | Yes |
| `GET` | `/admin/system-health` | Operational health status & user counts | Yes (Admin) |

