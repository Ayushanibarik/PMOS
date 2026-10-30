# Privacy, Data Governance & India DPDP Act 2023 Compliance

## 1. Statutory Alignment

CycleAware is engineered from first principles to align with:
- **India's Digital Personal Data Protection (DPDP) Act, 2023**
- The notified DPDP Rules, 2025
- General Data Protection Regulation (GDPR) Privacy Principles

---

## 2. Key DPDP Compliance Implementations

### Purpose-Specific Consent Architecture
- Mandatory service delivery consent is strictly unbundled from:
  - Optional academic research participation
  - Optional product analytics
  - Optional reminder notifications
- Consents are stored in `user_consents` with version numbers (`1.0`), creation timestamps, and revocation timestamps.

### Right to Information and Access (Section 11)
- Data principals can view all stored personal information, consent states, and security access audit events via the application UI.

### Right to Data Portability (Section 12)
- Endpoints `POST /api/v1/privacy/export` and `GET /api/v1/reports/export/csv` provide comprehensive JSON and CSV structured downloads of all patient data.

### Right to Correction and Erasure (Section 12)
- Full self-service account deletion is implemented via `POST /api/v1/privacy/delete-account`, which executes cascading deletion of all periods, symptoms, measurements, lab records, documents, and profile attributes.

### Children and Adolescent Protections (Section 9)
- Users under 18 receive age-appropriate pubertal guidance.
- Adult diagnostic thresholds and automated risk estimations are strictly blocked for minor users.
