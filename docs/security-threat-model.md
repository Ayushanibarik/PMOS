# Security Threat Model & Hardening Architecture

## 1. Threat Modeling Overview (STRIDE Analysis)

| Threat | Risk Surface | CycleAware Mitigation |
|---|---|---|
| **Spoofing Identity** | Token theft, forged credentials | Short-lived JWTs, secure bcrypt hashing, session token verification |
| **Tampering with Data** | Modification of patient or clinician records | Foreign-key ownership checks, immutable clinician review records, audit logging |
| **Repudiation** | Denying data access or sharing | `audit_events` table logs all logins, sharing grants, exports, and deletions |
| **Information Disclosure** | Cross-patient record leakage | Strict SQL-level user scoping on all API endpoints; private upload storage |
| **Denial of Service** | File upload abuse, heavy queries | 10MB file size ceiling, MIME validation, indexed queries, pagination |
| **Elevation of Privilege** | Normal user calling clinician/admin APIs | Strict FastAPI role-check dependency (`require_role`) |

---

## 2. Mandatory OWASP Safeguards
- **SQL Injection Prevention**: 100% parameterized SQLAlchemy 2.0 ORM queries.
- **Cross-Site Scripting (XSS)**: Automatic React JSX output encoding and sanitized HTML.
- **Insecure Direct Object References (IDOR)**: Every query filtering on `period_id`, `symptom_id`, `document_id` strictly requires `user_id == current_user.id`.
- **Malicious Upload Execution**: Files stored in private directory outside webroot with generated UUID filenames; executable MIME types blocked.

