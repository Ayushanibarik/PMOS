import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models import (
    User,
    UserProfile,
    MenstrualPeriod,
    SymptomCatalogue,
    SymptomEntry,
    BodyMeasurement,
    LaboratoryResult,
    UploadedDocument,
    PatternObservation,
    ClinicianProfile,
    PatientSharingPermission,
    ClinicianNote,
    AuditEvent
)
from app.api.v1 import (
    auth,
    patients,
    cycles,
    symptoms,
    measurements,
    clinical_records,
    observations,
    reports,
    clinicians,
    privacy,
    admin,
    ml
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Ensure upload directory exists
    os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)
    
    # Seed default symptom catalogue if empty
    db = SessionLocal()
    try:
        from app.api.v1.symptoms import DEFAULT_CATALOGUE
        if db.query(SymptomCatalogue).count() == 0:
            for item in DEFAULT_CATALOGUE:
                db.add(SymptomCatalogue(
                    code=item["code"],
                    name=item["name"],
                    category=item["category"],
                    description=item["description"]
                ))
            db.commit()
    finally:
        db.close()

    yield

app = FastAPI(
    title=f"{settings.APP_NAME} — Women's Hormonal Health Intelligence Platform",
    description=(
        "Longitudinal menstrual health monitoring, cycle analytics, and evidence-informed "
        "pattern recognition platform adhering to international PCOS/PMOS 2023 guidelines."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(patients.router, prefix=settings.API_V1_PREFIX)
app.include_router(cycles.router, prefix=settings.API_V1_PREFIX)
app.include_router(symptoms.router, prefix=settings.API_V1_PREFIX)
app.include_router(measurements.router, prefix=settings.API_V1_PREFIX)
app.include_router(clinical_records.router, prefix=settings.API_V1_PREFIX)
app.include_router(observations.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(clinicians.router, prefix=settings.API_V1_PREFIX)
app.include_router(privacy.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(ml.router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs_url": "/docs",
        "version": settings.APP_VERSION
    }
