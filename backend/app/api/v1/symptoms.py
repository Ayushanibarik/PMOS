from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.symptom import SymptomEntry, SymptomCatalogue
from app.schemas.symptom import SymptomCreate, SymptomResponse, SymptomCatalogueItem, SymptomTrendItem

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])

DEFAULT_CATALOGUE = [
    # Menstrual
    {"code": "cramps", "name": "Pelvic Cramps", "category": "menstrual", "description": "Uterine cramping or lower abdominal discomfort"},
    {"code": "heavy_bleeding", "name": "Heavy Bleeding", "category": "menstrual", "description": "Needing to change protection very frequently"},
    {"code": "spotting", "name": "Mid-Cycle Spotting", "category": "menstrual", "description": "Light bleeding outside regular period days"},
    {"code": "pelvic_pain", "name": "Pelvic Pain", "category": "menstrual", "description": "General pelvic aching or tension"},
    
    # Skin
    {"code": "facial_acne", "name": "Facial Acne", "category": "skin", "description": "Cystic or inflammatory acne on chin, jawline, or cheeks"},
    {"code": "body_acne", "name": "Chest / Back Acne", "category": "skin", "description": "Acne on upper back, chest, or shoulders"},
    {"code": "oily_skin", "name": "Oily Skin", "category": "skin", "description": "Excessive cutaneous sebum production"},
    {"code": "dark_skin_patches", "name": "Darkened Skin Patches", "category": "skin", "description": "Velvety hyperpigmentation on neck or skin folds (Acanthosis nigricans)"},

    # Hair
    {"code": "unwanted_facial_hair", "name": "Facial Hair Growth", "category": "hair", "description": "Coarse hair on upper lip, chin, or sideburns (Hirsutism)"},
    {"code": "body_hair_growth", "name": "Excess Body Hair", "category": "hair", "description": "Coarse hair on chest, abdomen, or lower back"},
    {"code": "hair_thinning", "name": "Scalp Hair Thinning", "category": "hair", "description": "Diffuse thinning or widening parting (Female pattern hair loss)"},

    # Metabolic
    {"code": "weight_fluctuations", "name": "Unexplained Weight Changes", "category": "metabolic", "description": "Rapid gain or difficulty with weight stability"},
    {"code": "sugar_cravings", "name": "Intense Sugar Cravings", "category": "metabolic", "description": "Strong urges for carbohydrates or sweets, often postprandial"},
    {"code": "energy_crashes", "name": "Post-Meal Fatigue / Crashes", "category": "metabolic", "description": "Sudden drop in alertness following meals"},

    # Wellbeing
    {"code": "fatigue", "name": "Chronic Fatigue", "category": "wellbeing", "description": "Persistent lack of energy not relieved by sleep"},
    {"code": "mood_swings", "name": "Mood Fluctuations / Irritability", "category": "wellbeing", "description": "Marked shifts in emotional state or sensitivity"},
    {"code": "sleep_disturbances", "name": "Sleep Disturbances / Insomnia", "category": "wellbeing", "description": "Difficulty falling or staying asleep"},
    {"code": "brain_fog", "name": "Brain Fog", "category": "wellbeing", "description": "Trouble focusing or sluggish cognitive clarity"},
]

@router.get("/catalogue", response_model=List[SymptomCatalogueItem])
def get_catalogue(db: Session = Depends(get_db)):
    items = db.query(SymptomCatalogue).all()
    if not items:
        # Seed default catalogue
        for item in DEFAULT_CATALOGUE:
            db.add(SymptomCatalogue(
                code=item["code"],
                name=item["name"],
                category=item["category"],
                description=item["description"]
            ))
        db.commit()
        items = db.query(SymptomCatalogue).all()

    return [
        SymptomCatalogueItem(
            code=i.code,
            name=i.name,
            category=i.category,
            description=i.description
        ) for i in items
    ]

@router.get("", response_model=List[SymptomResponse])
def list_symptoms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(SymptomEntry).filter(
        SymptomEntry.user_id == current_user.id
    ).order_by(SymptomEntry.date.desc()).all()

@router.post("", response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
def create_symptom(
    symptom_in: SymptomCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    entry = SymptomEntry(
        user_id=current_user.id,
        symptom_code=symptom_in.symptom_code,
        symptom_name=symptom_in.symptom_name,
        category=symptom_in.category,
        severity=symptom_in.severity,
        date=symptom_in.date,
        notes=symptom_in.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/trends", response_model=List[SymptomTrendItem])
def get_symptom_trends(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    entries = db.query(SymptomEntry).filter(
        SymptomEntry.user_id == current_user.id
    ).all()

    groups: Dict[str, List[SymptomEntry]] = {}
    for e in entries:
        groups.setdefault(e.symptom_name, []).append(e)

    trends = []
    for name, items in groups.items():
        severities = [i.severity for i in items]
        freq = len(items)
        avg_sev = sum(severities) / freq
        max_sev = max(severities)

        # Check trend if >= 2 entries
        sorted_items = sorted(items, key=lambda x: x.date)
        trend = "stable"
        if len(sorted_items) >= 2:
            first_half = sorted_items[:len(sorted_items)//2]
            second_half = sorted_items[len(sorted_items)//2:]
            avg1 = sum(x.severity for x in first_half) / len(first_half)
            avg2 = sum(x.severity for x in second_half) / len(second_half)
            if avg2 > avg1 + 0.5:
                trend = "increasing"
            elif avg2 < avg1 - 0.5:
                trend = "decreasing"

        trends.append(SymptomTrendItem(
            symptom_name=name,
            category=items[0].category,
            frequency_count=freq,
            average_severity=round(avg_sev, 1),
            max_severity=max_sev,
            recent_trend=trend
        ))

    trends.sort(key=lambda t: t.frequency_count, reverse=True)
    return trends

@router.delete("/{symptom_id}")
def delete_symptom(
    symptom_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    entry = db.query(SymptomEntry).filter(
        SymptomEntry.id == symptom_id,
        SymptomEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Symptom entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Symptom entry deleted successfully."}
