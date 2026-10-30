# CycleAware Clinical Safety & Non-Diagnostic Architecture

## 1. Core Medical Invariants

CycleAware is engineered as an **early-pattern identification and health-monitoring platform**. It is explicitly **NOT** a diagnostic device, prescription tool, or medical consultation substitute.

### Non-Diagnostic Commitments
1. **Never Output a Medical Diagnosis**: Under no circumstances does the platform issue a diagnosis of PCOS, PCOD, or PMOS.
2. **Never Fabricate Probabilities**: The system does not present unvalidated statistical probabilities as definitive biological risks.
3. **Five Distinct Categories of Information**:
   - **User-reported observations**: Bleeding dates, symptom entries, and personal notes.
   - **Computed statistical trends**: Mathematically calculated cycle lengths, medians, and variation intervals.
   - **Algorithm-generated pattern flags**: Rule-based outputs derived from published international guidelines.
   - **Model-generated screening outputs**: Clearly labeled research prototypes, restricted to non-clinical demonstration.
   - **Clinician-confirmed diagnoses**: Clinical determinations made solely by licensed physicians.

---

## 2. Evidence-Based Life-Stage Reference Framework

Derived from the *2023 International Evidence-Based Guideline for the Assessment and Management of Polycystic Ovary Syndrome (PCOS/PMOS)*:

| Reproductive Stage | Ovulatory Reference Range | Clinical Action Threshold |
|---|---|---|
| **Post-menarche Year 1** | Highly variable physiological transition | Irregularity is normal; reassurance and routine hygiene |
| **1 to <3 Years Post-Menarche** | 21 to 45 days | Cycles <21 days or >45 days warrant attention |
| **≥3 Years Post-Menarche to Perimenopause** | 21 to 35 days, or ≥8 cycles/year | Cycles <21, >35 days, or <8 cycles/year warrant clinical assessment |
| **Any Life Stage (Post Year 1)** | <90 days | Any single cycle interval >90 days warrants secondary amenorrhea evaluation |

---

## 3. Adolescent Specific Safeguards (<8 Years from Menarche)

1. **Ultrasound Guardrail**: The 2023 International Guideline explicitly advises against using pelvic ultrasound for PCOS diagnosis in adolescents due to the high physiological prevalence of multi-follicular ovaries during normal pubertal development.
2. **AMH Guardrail**: Serum Anti-Müllerian Hormone (AMH) has low diagnostic specificity in adolescents and is not recommended as a diagnostic tool.
3. **Age-Appropriate UI**: For users under 18 or within 3 years of menarche, CycleAware provides pubertal education without adult risk scores.

---

## 4. Differential Diagnosis Reminders

The clinical rule engine automatically reminds users and clinicians that menstrual irregularity and androgenic features can stem from distinct endocrine conditions:
- **Thyroid Disorders**: Evaluated via TSH.
- **Hyperprolactinemia**: Evaluated via Prolactin.
- **Non-Classic Congenital Adrenal Hyperplasia (NCAH)**: Evaluated via 17-OHP.

---

## 5. Emergency Red-Flag Escalation

If users report severe sudden pelvic pain, fever, or soaking through multiple pads per hour, CycleAware displays an immediate emergency medical alert advising emergency clinical consultation.

