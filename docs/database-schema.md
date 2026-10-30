# Database Schema Documentation

## Database Engine
- **Local Dev / Test**: SQLite (`sqlite:///./cycleaware.db`)
- **Production**: PostgreSQL 16+ (`postgresql+psycopg://...`)

---

## Entity Relational Model

### 1. Identity & Consent
- `users`:
  - `id` (VARCHAR(36), PK, UUID)
  - `email` (VARCHAR(255), UNIQUE, INDEX)
  - `hashed_password` (VARCHAR(255))
  - `full_name` (VARCHAR(255))
  - `role` (VARCHAR(20), default: 'patient')
  - `is_active` (BOOLEAN)
  - `is_verified` (BOOLEAN)
  - `created_at`, `updated_at` (DATETIME)
- `user_profiles`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE)
  - `age`, `menarche_age` (INTEGER)
  - `country`, `preferred_language`, `timezone` (VARCHAR)
  - `is_under_18` (BOOLEAN)
  - `cycle_regularity_self_report` (VARCHAR)
  - `typical_cycle_length`, `typical_bleeding_duration` (INTEGER)
  - `last_period_date` (VARCHAR(10))
  - `experiences_skipped_periods` (BOOLEAN)
  - `has_prior_pcos_diagnosis`, `using_hormonal_contraception` (BOOLEAN)
  - `onboarding_completed` (BOOLEAN)
- `user_consents`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE)
  - `consent_type` (VARCHAR)
  - `is_granted` (BOOLEAN)
  - `consent_version` (VARCHAR)
  - `granted_at`, `revoked_at` (DATETIME)
- `audit_events`:
  - `id` (VARCHAR(36), PK)
  - `user_id`, `actor_id` (VARCHAR(36), INDEX)
  - `event_type`, `resource_type`, `resource_id` (VARCHAR)
  - `created_at` (DATETIME)

### 2. Menstrual Records
- `menstrual_periods`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE, INDEX)
  - `start_date` (VARCHAR(10), INDEX)
  - `end_date` (VARCHAR(10))
  - `flow_intensity` (VARCHAR(20))
  - `has_spotting` (BOOLEAN)
  - `associated_symptoms` (TEXT)
  - `notes` (TEXT)
- `cycle_summaries`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE, INDEX)
  - `cycle_start_date`, `cycle_end_date` (VARCHAR(10))
  - `cycle_length_days` (INTEGER)
  - `bleeding_duration_days` (INTEGER)
  - `is_irregular_by_guideline` (BOOLEAN)
  - `calculated_at` (DATETIME)

### 3. Symptoms & Measurements
- `symptom_catalogue`:
  - `id` (VARCHAR(36), PK)
  - `code` (VARCHAR(50), UNIQUE, INDEX)
  - `name`, `category`, `description` (VARCHAR)
- `symptom_entries`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE, INDEX)
  - `symptom_code`, `symptom_name`, `category` (VARCHAR, INDEX)
  - `severity` (INTEGER, 0 to 5)
  - `date` (VARCHAR(10), INDEX)
  - `notes` (TEXT)
- `body_measurements`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE, INDEX)
  - `date` (VARCHAR(10), INDEX)
  - `weight_kg`, `height_cm`, `waist_cm`, `bmi` (FLOAT)
  - `resting_heart_rate`, `systolic_bp`, `diastolic_bp` (INTEGER)
  - `sleep_hours` (FLOAT)
  - `data_source` (VARCHAR)

### 4. Clinical Documents & Sharing
- `laboratory_results`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE, INDEX)
  - `test_name` (VARCHAR(100), INDEX)
  - `value` (FLOAT), `unit` (VARCHAR(50))
  - `test_date` (VARCHAR(10), INDEX)
  - `laboratory_name`, `reference_range` (VARCHAR)
  - `clinician_reviewed` (BOOLEAN)
- `uploaded_documents`:
  - `id` (VARCHAR(36), PK)
  - `user_id` (VARCHAR(36), FK -> users.id, ON DELETE CASCADE)
  - `original_filename`, `stored_filename`, `file_path`, `mime_type` (VARCHAR)
  - `file_size_bytes` (INTEGER)
- `patient_sharing_permissions`:
  - `id` (VARCHAR(36), PK)
  - `patient_id`, `clinician_id` (VARCHAR(36), INDEX)
  - `access_code` (VARCHAR(50), INDEX)
  - `sharing_scope`, `valid_until` (VARCHAR)
  - `is_revoked` (BOOLEAN)
- `clinician_notes`:
  - `id` (VARCHAR(36), PK)
  - `patient_id`, `clinician_id` (VARCHAR(36), INDEX)
  - `consultation_date` (VARCHAR(10))
  - `general_notes`, `cycle_review`, `symptom_review`, `recommendation` (TEXT)
  - `referral_status` (VARCHAR(50))
