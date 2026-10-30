"""Vernacular Voice-to-Symptom NLP Service

Implements U08: Multilingual clinical concept extraction from regional language speech/text
supporting Hindi, Tamil, and English with negation detection and mandatory user confirmation.
"""

import re
from typing import Dict, Any, List

class VernacularNlpService:
    # Terminology dictionary mapping vernacular phrases to standardized catalogue codes
    CONCEPT_MAP = [
        # Menstrual Irregularity
        {
            "code": "irregular_cycles",
            "name": "Menstrual Cycle Irregularity",
            "category": "menstrual",
            "terms": [
                "पीरियड्स नहीं आ रहे", "माहवारी नहीं आई", "मासिक धर्म रुका हुआ है", "डेट लेट हो गई",
                "पीरियड लेट", "अनियमित पीरियड्स", "डेट नहीं आई", "दो महीने से पीरियड नहीं",
                "மாதவிடாய் தாமதம்", "மாதவிடாய் வரவில்லை", "ஒழுங்கற்ற மாதவிடாய்", "பீரியட்ஸ் வரல",
                "periods missed", "late period", "irregular period", "delayed menses", "skipped period"
            ]
        },
        # Acne / Skin
        {
            "code": "facial_acne",
            "name": "Facial Acne / Breakouts",
            "category": "skin",
            "terms": [
                "मुँहासे", "पिंपल्स", "कील-मुंहासे", "चेहरे पर दाने", "चेहरे पर फुंसी",
                "முகப்பரு", "பருக்கள்", "முகத்தில் பரு",
                "acne", "pimples", "facial breakouts", "cystic acne", "zits"
            ]
        },
        # Hirsutism / Facial Hair
        {
            "code": "excess_facial_hair",
            "name": "Excess Facial / Body Hair",
            "category": "hair",
            "terms": [
                "अनचाहे बाल", "चेहरे पर बाल", "ठोड़ी पर बाल", "गालों पर बाल", "होठों के ऊपर बाल",
                "தேவையற்ற முடி", "முகத்தில் முடி", "தாடி முடி",
                "facial hair", "chin hair", "upper lip hair", "unwanted hair", "hirsutism"
            ]
        },
        # Scalp Hair Thinning
        {
            "code": "hair_thinning",
            "name": "Scalp Hair Loss / Thinning",
            "category": "hair",
            "terms": [
                "बाल झड़ रहे हैं", "सिर के बाल पतले", "बाल गिरना", "बालों का गिरना",
                "முடி கொட்டுதல்", "முடி உதிர்தல்", "தலை முடி மெலிதல்",
                "hair loss", "hair fall", "thinning hair", "scalp shedding"
            ]
        },
        # Menstrual Cramps / Pelvic Pain
        {
            "code": "menstrual_cramps",
            "name": "Pelvic Pain / Menstrual Cramps",
            "category": "menstrual",
            "terms": [
                "पेट में दर्द", "क्रैम्प्स", "पेल्विक पेन", "माहवारी का दर्द", "पेट ऐंठन", "दर्द",
                "வயிற்று வலி", "இடுப்பு வலி", "மாதவிடாய் வலி", "வலி",
                "cramps", "period pain", "pelvic pain", "menstrual ache", "pain"
            ]
        },
        # Fatigue / Low Energy
        {
            "code": "fatigue",
            "name": "Fatigue / Low Energy",
            "category": "wellbeing",
            "terms": [
                "थकान", "कमजोरी", "सुस्ती", "दिनभर थकान", "ऊर्जा की कमी",
                "களைப்பு", "சோர்வு", "உடல் பலவீனம்",
                "fatigue", "tiredness", "exhaustion", "low energy", "sluggishness"
            ]
        },
        # Carbohydrate / Sugar Cravings
        {
            "code": "carb_craving",
            "name": "Carbohydrate / Sugar Cravings",
            "category": "metabolic",
            "terms": [
                "मीठा खाने का मन", "क्रेविंग", "शुगर क्रेविंग", "मीठे की तलब",
                "இனிப்பு ஆசை", "உணவு ஏக்கம்",
                "sugar craving", "carb craving", "craving sweets", "intense hunger"
            ]
        },
        # Mood Fluctuations / Irritability
        {
            "code": "mood_swings",
            "name": "Mood Swings / Irritability",
            "category": "wellbeing",
            "terms": [
                "मूड स्विंग्स", "चिड़चिड़ापन", "गुस्सा आना", "मन उदास होना", "रोना आना",
                "மனநிலை மாற்றம்", "எரிச்சல்", "கோபம்",
                "mood swings", "irritability", "crying spells", "emotional sensitivity"
            ]
        }
    ]

    NEGATION_WORDS = [
        "नहीं", "ना", "बिना", "मुक्त",
        "இல்லை", "வலியில்லை", "இல்ல",
        "no", "not", "without", "never", "none"
    ]

    HIGH_SEVERITY_WORDS = [
        "बहुत", "ज्यादा", "अत्यधिक", "गंभीर", "सख्त",
        "அதிகம்", "கடுமையான", "மிகவும்",
        "severe", "extreme", "very", "intense", "unbearable", "high"
    ]

    MILD_SEVERITY_WORDS = [
        "थोड़ा", "हल्का", "कम", "मामूली",
        "குறைவு", "லேசான", "கொஞ்சம்",
        "mild", "slight", "a little", "minor", "low"
    ]

    @classmethod
    def extract_concepts(cls, text: str, default_lang: str = "hi") -> Dict[str, Any]:
        cleaned_text = text.strip()
        lower_text = cleaned_text.lower()

        # Language detection heuristic
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', cleaned_text))
        has_tamil = bool(re.search(r'[\u0B80-\u0BFF]', cleaned_text))
        detected_lang = "hi" if has_devanagari else ("ta" if has_tamil else default_lang)

        # Check for negation in surrounding context
        has_negation = any(neg in lower_text for neg in cls.NEGATION_WORDS)

        # Determine severity
        severity = 3
        if any(w in lower_text for w in cls.HIGH_SEVERITY_WORDS):
            severity = 5
        elif any(w in lower_text for w in cls.MILD_SEVERITY_WORDS):
            severity = 1

        extracted = []
        for item in cls.CONCEPT_MAP:
            for term in item["terms"]:
                if term.lower() in lower_text:
                    # Check localized negation around the matched term
                    term_idx = lower_text.find(term.lower())
                    surrounding = lower_text[max(0, term_idx - 25):min(len(lower_text), term_idx + len(term) + 25)]
                    is_term_negated = any(neg in surrounding for neg in cls.NEGATION_WORDS)

                    extracted.append({
                        "symptom_code": item["code"],
                        "symptom_name": item["name"],
                        "category": item["category"],
                        "detected_severity": 0 if is_term_negated else severity,
                        "confidence": 0.88 if is_term_negated else 0.94,
                        "matched_phrase": term,
                        "is_negated": is_term_negated
                    })
                    break  # One match per concept

        return {
            "detected_language": detected_lang,
            "concepts": extracted,
            "requires_user_confirmation": True,
            "disclaimer": (
                "Speech / vernacular NLP provides draft suggestions only. "
                "You must visually review and confirm each symptom before it is added to your permanent health journal."
            )
        }
