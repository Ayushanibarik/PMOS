# CycleAware System Architecture

## 1. Architectural Overview

CycleAware is structured as a **modular monolith** with strict separation of concerns across presentation, business services, clinical observation logic, and machine learning infrastructure.

```
+-----------------------------------------------------------------------+
|                           CycleAware Client                           |
|      (React 18, Vite, TypeScript, Tailwind CSS, Recharts, i18next)    |
+-----------------------------------------------------------------------+
                                   |  HTTPS / REST JSON
                                   v
+-----------------------------------------------------------------------+
|                        FastAPI Backend Engine                         |
|   +---------------------------------------------------------------+   |
|   | API Routers (/auth, /cycles, /symptoms, /labs, /observations) |   |
|   +---------------------------------------------------------------+   |
|                                  |                                    |
|   +---------------------------------------------------------------+   |
|   | Core Services (CycleAnalytics, ReportService, RuleEngine)     |   |
|   +---------------------------------------------------------------+   |
|                                  |                                    |
|   +---------------------------------------------------------------+   |
|   | SQLAlchemy 2.0 ORM & Multi-Role Authorization (RBAC)          |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
               |                                            |
               v                                            v
+-------------------------------+          +-------------------------------+
|     PostgreSQL / SQLite       |          |      Local Storage Vault      |
|  (Relational Health Records)  |          |      (/private_uploads)       |
+-------------------------------+          +-------------------------------+
                                   ^
                                   | Controlled Inference / Metadata
+-----------------------------------------------------------------------+
|                    Machine Learning Infrastructure                    |
|   +---------------------------------------------------------------+   |
|   | Model Registry (JSON Metadata, Approval Flags, Metrics)        |   |
|   +---------------------------------------------------------------+   |
|   | Experimental Pipeline (Scikit-Learn Random Forest, SHAP)      |   |
|   +---------------------------------------------------------------+   |
|   | Synthetic Research Dataset (N=500 cohort with dictionary)     |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

---

## 2. Security & Privacy Architecture

- **Stateless JWT Authentication**: Access tokens (HS256) with role claims.
- **Role-Based Access Control (RBAC)**: Four roles (`patient`, `clinician`, `admin`, `researcher`).
- **Data Subject Rights (DPDP Act 2023)**: Complete JSON data export and account erasure endpoints.
- **Patient-Controlled Sharing**: Time-limited and scope-restricted access codes for clinicians.
- **Private Document Vault**: Uploaded PDFs and images are stored with UUID filenames outside the webroot; downloads enforce authenticated ownership verification.

