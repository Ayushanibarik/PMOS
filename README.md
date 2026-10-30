# CycleAware — Women's Hormonal Health Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![DPDP Act](https://img.shields.io/badge/Privacy-India%20DPDP%20Act%202023-purple)](#)
[![Clinical Guidelines](https://img.shields.io/badge/Guidelines-2023%20International%20PCOS%2FPMOS-rose)](#)

> **IMPORTANT MEDICAL NOTICE**: CycleAware is an early-pattern identification and health-monitoring platform. It is **NOT** an automated diagnostic device, does not provide definitive medical diagnoses of PCOS, PCOD, or PMOS, and does not prescribe medical therapies. All software observations are designed to empower clinical consultations with qualified healthcare professionals.

---

## 1. Product Identity & Purpose

**CycleAware** is an integrated full-stack digital health platform designed to help women maintain structured longitudinal records of their menstrual cycles, physiological symptoms, and clinical laboratory reports.

### Key Capabilities
- **Longitudinal Menstrual Cycle Engine**: Accurate calculation of cycle lengths, median intervals, standard deviation variability, and 2023 International Guideline ovulatory bounds.
- **Statistical Prediction Window**: Rolling median and variation prediction windows computed exclusively when $\ge 3$ cycles of history exist (displays "Insufficient history" otherwise to prevent false precision).
- **Multi-Domain Symptom Tracking**: Categorized journal for skin (acne, acanthosis), hair (hirsutism, alopecia), metabolic (cravings, weight), and wellbeing symptoms on a standardized 0–5 severity scale.
- **Physiological & Lab Records**: Optional tracking of weight, height (BMI with context), waist circumference (South Asian $\ge 80\text{ cm}$ reference cutoff), blood pressure, sleep, and clinical hormonal assays (Testosterone, AMH, TSH, Glucose).
- **2023 Evidence-Based Rule Engine**: Transparent observation cards incorporating time-since-menarche strata, adolescent safeguards (warning against inappropriate ultrasound/AMH), and mandatory differential diagnosis reminders.
- **Doctor-Patient Collaboration**: Time-limited and scope-restricted access codes (e.g., `CA-DEMO2026`) enabling authorized clinicians to review records and record separate consultation assessments.
- **Data Governance & Portability**: DPDP Act 2023 compliance with unbundled granular consent, full machine-readable JSON export, formatted PDF export, and cascading account erasure.
- **Explainable Machine Learning Infrastructure**: Reproducible research pipeline with Scikit-learn Random Forest, SHAP feature attributions, and a documented Model Registry with strict non-clinical safety guardrails.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, i18next (English, Hindi, Odia).
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, ReportLab (PDF generation), Pytest.
- **Database**: SQLite (zero-config local dev & testing) / PostgreSQL 16+ (production).
- **Machine Learning**: NumPy, Pandas, Scikit-learn, Joblib, SHAP explainability.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.11+
- git

### Step 1: Clone and Set Up Backend
```bash
# Set up virtual environment
uv venv backend/.venv
uv pip install -r backend/requirements.txt --python backend/.venv/Scripts/python.exe

# Seed demonstration accounts & 6 months of synthetic health records
backend/.venv/Scripts/python.exe scripts/seed_demo_data.py

# Launch Backend Server
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### Step 2: Set Up and Run Frontend
```bash
# In a new terminal window
npm install --prefix frontend
npm run dev --prefix frontend
```
Open `http://localhost:5173` in your browser.

---

## 4. Demonstration Accounts (Pre-Seeded)

The repository includes a safe synthetic seed script (`scripts/seed_demo_data.py`) with three pre-configured demonstration accounts:

| Portal | Email | Password | Data Included |
|---|---|---|---|
| **Patient Portal** | `patient@cycleaware.local` | `DemoPatient123!` | 6 cycles (irregularity pattern), symptoms, measurements, lab tests |
| **Clinician Portal** | `doctor@cycleaware.local` | `DemoDoctor123!` | Verified license, active link to patient, consultation note |
| **Admin Portal** | `admin@cycleaware.local` | `DemoAdmin123!` | Model registry, audit events, system metrics |

> **Active Sharing Access Code**: `CA-DEMO2026` (Pre-linked between patient and clinician).

---

## 5. Running Automated Tests

### Backend Test Suite (Pytest)
```bash
backend/.venv/Scripts/pytest.exe backend/tests/
```
*Executes 10 automated tests covering JWT auth, cycle analytics, adolescent safety rules, guideline observation engine, clinician access isolation, privacy exports, and experimental ML endpoints.*

### Frontend Test Suite (Vitest) & Build
```bash
# Run unit & calculation tests
npm run test --prefix frontend

# Verify production Vite build & TypeScript checks
npm run build --prefix frontend
```

---

## 6. Docker Compose Deployment

To build and launch the production containerized stack:
```bash
docker-compose up --build -d
```
- **Web UI**: `http://localhost`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## 7. Documentation Index

Detailed engineering and clinical governance specifications are located in `/docs`:
- [Clinical Safety Architecture](docs/clinical-safety.md)
- [Clinical Rule Evidence Sources](docs/clinical-rule-sources.md)
- [System Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api-documentation.md)
- [Privacy & DPDP Act Compliance](docs/privacy-and-consent.md)
- [Model Card & Registry Specification](docs/model-card-template.md)
- [Prospective Model Validation Plan](docs/model-validation-plan.md)
- [Security Threat Model](docs/security-threat-model.md)
- [Deployment Guide](docs/deployment.md)
- [Known Limitations & Future Work](docs/known-limitations.md)

---

## 8. License & Medical Ethics Notice
Licensed under the Apache 2.0 License. All synthetic research data is intended exclusively for software validation and non-clinical demonstrations.
