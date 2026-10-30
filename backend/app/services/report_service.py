import io
import csv
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportService:
    @staticmethod
    def generate_csv_export(patient_data: Dict[str, Any]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["=== CYCLEAWARE PATIENT HEALTH DATA EXPORT ==="])
        writer.writerow(["Generated At", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["Notice", "Confidential Health Record — For Personal / Clinical Use Only"])
        writer.writerow([])

        # Profile
        profile = patient_data.get("profile", {})
        writer.writerow(["--- PATIENT PROFILE ---"])
        writer.writerow(["Age", profile.get("age", "Not specified")])
        writer.writerow(["Menarche Age", profile.get("menarche_age", "Not specified")])
        writer.writerow(["Country", profile.get("country", "")])
        writer.writerow(["Hormonal Contraception", "Yes" if profile.get("using_hormonal_contraception") else "No"])
        writer.writerow([])

        # Periods
        writer.writerow(["--- MENSTRUAL PERIODS ---"])
        writer.writerow(["Start Date", "End Date", "Flow Intensity", "Spotting", "Associated Symptoms", "Notes"])
        for p in patient_data.get("periods", []):
            writer.writerow([
                p.get("start_date", ""),
                p.get("end_date", ""),
                p.get("flow_intensity", ""),
                "Yes" if p.get("has_spotting") else "No",
                p.get("associated_symptoms", ""),
                p.get("notes", "")
            ])
        writer.writerow([])

        # Symptoms
        writer.writerow(["--- SYMPTOM LOGS ---"])
        writer.writerow(["Date", "Category", "Symptom Name", "Severity (0-5)", "Phase Checkpoint", "Grooming Modality", "RVI Score", "Notes"])
        for s in patient_data.get("symptoms", []):
            writer.writerow([
                s.get("date", ""),
                s.get("category", ""),
                s.get("symptom_name", ""),
                s.get("severity", ""),
                s.get("phase_checkpoint", ""),
                s.get("grooming_modality", ""),
                s.get("rvi_score", ""),
                s.get("notes", "")
            ])
        writer.writerow([])

        # Measurements
        writer.writerow(["--- MEASUREMENTS ---"])
        writer.writerow(["Date", "Weight (kg)", "Height (cm)", "BMI", "Waist (cm)", "WHtR", "Neck (cm)", "Resting HR", "BP", "Sleep (hrs)"])
        for m in patient_data.get("measurements", []):
            bp = f"{m.get('systolic_bp', '')}/{m.get('diastolic_bp', '')}" if m.get('systolic_bp') else ""
            writer.writerow([
                m.get("date", ""),
                m.get("weight_kg", ""),
                m.get("height_cm", ""),
                m.get("bmi", ""),
                m.get("waist_cm", ""),
                m.get("waist_to_height_ratio", ""),
                m.get("neck_circumference_cm", ""),
                m.get("resting_heart_rate", ""),
                bp,
                m.get("sleep_hours", "")
            ])
        writer.writerow([])

        # Lab Results
        writer.writerow(["--- CLINICAL LABORATORY TESTS ---"])
        writer.writerow(["Test Date", "Test Name", "Value", "Unit", "Reference Range", "Laboratory"])
        for l in patient_data.get("lab_results", []):
            writer.writerow([
                l.get("test_date", ""),
                l.get("test_name", ""),
                l.get("value", ""),
                l.get("unit", ""),
                l.get("reference_range", ""),
                l.get("laboratory_name", "")
            ])

        return output.getvalue()

    @staticmethod
    def generate_pdf_report(patient_name: str, patient_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=32,
            bottomMargin=32
        )

        styles = getSampleStyleSheet()
        
        # Color definitions
        c_plum = colors.HexColor("#422B46")
        c_lavender = colors.HexColor("#A995BE")
        c_ivory = colors.HexColor("#FAF8F5")
        c_slate = colors.HexColor("#4D5663")
        c_amber_bg = colors.HexColor("#FEF3C7")
        c_amber_border = colors.HexColor("#F59E0B")

        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=c_plum,
            spaceAfter=2
        )
        subtitle_style = ParagraphStyle(
            "ReportSub",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=c_slate,
            spaceAfter=8
        )
        disclaimer_style = ParagraphStyle(
            "ReportDisclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=colors.HexColor("#991B1B"),
            spaceAfter=4
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=c_plum,
            spaceBefore=8,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            "ReportBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=c_slate,
            spaceAfter=3
        )

        elements = []

        # Header
        elements.append(Paragraph("CycleAware — Gynecologist-Ready Longitudinal Clinical Triage Summary", title_style))
        elements.append(Paragraph(
            f"Patient: <b>{patient_name}</b> | Generated: {datetime.now(timezone.utc).strftime('%d %B %Y')} | "
            "Framework: 2023 International Evidence-Based Guidelines (Monash/ESHRE/ASRM)",
            subtitle_style
        ))
        
        # Medical Disclaimer Callout Box
        disclaimer_text = (
            "<b>MANDATORY CLINICAL NOTICE:</b> This summary is an evidence-informed longitudinal self-monitoring record. "
            "It is <b>NOT A MEDICAL DIAGNOSIS</b> and does not calculate disease probability. "
            "Final clinical assessment requires clinician examination, exclusion of mimics (TSH, Prolactin, 17-OHP), "
            "and formal diagnostic criteria evaluation."
        )
        elements.append(Table(
            [[Paragraph(disclaimer_text, disclaimer_style)]],
            colWidths=[540],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEE2E2")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#EF4444")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ])
        ))
        elements.append(Spacer(1, 6))

        # 1. Menstrual Cycle Statistics & Beta Drift
        analytics = patient_data.get("analytics", {})
        beta_drift = analytics.get("beta_drift", {})
        drift_slope = beta_drift.get("beta_drift_slope")
        drift_str = f"{drift_slope} days/cycle ({beta_drift.get('trend_direction', 'N/A')})" if drift_slope is not None else "Insufficient data (<3 cycles)"

        elements.append(Paragraph("1. Menstrual Cycle Regularity & Longitudinal Drift (Beta_drift)", section_style))
        cycle_table_data = [
            ["Total Completed Cycles", f"{analytics.get('total_recorded_cycles', 0)}", "Average Cycle Length", f"{analytics.get('average_cycle_length', 'N/A')} days"],
            ["Median Cycle Length", f"{analytics.get('median_cycle_length', 'N/A')} days", "Cycle Length Variation (Std)", f"+/- {analytics.get('cycle_length_variation_std', 'N/A')} days"],
            ["Min / Max Recorded", f"{analytics.get('min_cycle_length', 'N/A')} - {analytics.get('max_cycle_length', 'N/A')} days", "Irregular Cycles Count", f"{analytics.get('irregular_cycles_count', 0)}"],
            ["Longitudinal Drift (Beta_drift)", drift_str, "Clinical Guideline Status", str(analytics.get('guideline_status', 'N/A'))[:45]]
        ]
        t1 = Table(cycle_table_data, colWidths=[135, 135, 135, 135])
        t1.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), c_ivory),
            ("TEXTCOLOR", (0, 0), (-1, -1), c_slate),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 7.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 6))

        # 2. Pattern Alignment Index (PAI) & Multi-Axial Breakdown
        pai = patient_data.get("pai", {})
        if pai:
            elements.append(Paragraph(
                f"2. Pattern Alignment Index (PAI): <b>{pai.get('pai_score', 'N/A')}/100 — {pai.get('alignment_level', 'N/A')}</b> (Non-Diagnostic)",
                section_style
            ))
            pai_rows = [["Axis Name", "Weight", "Score", "Contribution", "Clinical Observation"]]
            for axis in pai.get("axes", []):
                pai_rows.append([
                    axis.get("axis_name", ""),
                    f"{axis.get('weight_pct', 0)}%",
                    f"{axis.get('raw_score', 0)}/100",
                    f"+{axis.get('weighted_contribution', 0)}",
                    axis.get("description", "")[:45]
                ])
            t_pai = Table(pai_rows, colWidths=[120, 45, 55, 60, 260])
            t_pai.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), c_plum),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]))
            elements.append(t_pai)
            elements.append(Spacer(1, 6))

        # 3. South Asian Anthropometric Phenotype
        measurements = patient_data.get("measurements", [])
        if measurements:
            latest_m = measurements[0]
            elements.append(Paragraph("3. South Asian Anthropometric & Cardiometabolic Context", section_style))
            whtr_val = latest_m.get("waist_to_height_ratio") or (
                round(latest_m.get("waist_cm", 0) / latest_m.get("height_cm", 1), 2)
                if (latest_m.get("waist_cm") and latest_m.get("height_cm")) else "N/A"
            )
            anthro_rows = [
                ["Weight", f"{latest_m.get('weight_kg', 'N/A')} kg", "Height", f"{latest_m.get('height_cm', 'N/A')} cm"],
                ["BMI (Asian-Indian Cutoff: 23)", f"{latest_m.get('bmi', 'N/A')} kg/m²", "Waist Circumference", f"{latest_m.get('waist_cm', 'N/A')} cm (Ref: <80 cm)"],
                ["Waist-to-Height Ratio (WHtR)", f"{whtr_val} (Ref: <0.50)", "Neck Circumference", f"{latest_m.get('neck_circumference_cm', 'N/A')} cm (Ref: <34 cm)"],
                ["Resting Heart Rate", f"{latest_m.get('resting_heart_rate', 'N/A')} bpm", "Blood Pressure", f"{latest_m.get('systolic_bp', '')}/{latest_m.get('diastolic_bp', '')} mmHg"]
            ]
            t_anthro = Table(anthro_rows, colWidths=[135, 135, 135, 135])
            t_anthro.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), c_ivory),
                ("TEXTCOLOR", (0, 0), (-1, -1), c_slate),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]))
            elements.append(t_anthro)
            elements.append(Spacer(1, 6))

        # 4. Clinical Observations & Safety Guardrails
        observations = patient_data.get("observations", [])
        if observations:
            elements.append(Paragraph("4. Clinical Pattern Observations & Safety Guardrails", section_style))
            for obs in observations[:3]:
                obs_text = f"• <b>{obs.get('title', '')}</b>: {obs.get('description', '')}"
                elements.append(Paragraph(obs_text, body_style))
            elements.append(Spacer(1, 4))

        # 5. Laboratory Records & Investigation Reminders
        labs = patient_data.get("lab_results", [])
        if labs:
            elements.append(Paragraph("5. Supplied Clinical Laboratory Investigations", section_style))
            lab_rows = [["Test Date", "Test Name", "Value", "Unit", "Lab Reference Range"]]
            for l in labs[:5]:
                lab_rows.append([
                    l.get("test_date", ""),
                    l.get("test_name", "")[:30],
                    str(l.get("value", "")),
                    l.get("unit", ""),
                    l.get("reference_range", "N/A")
                ])
            t3 = Table(lab_rows, colWidths=[70, 180, 50, 60, 180])
            t3.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), c_plum),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]))
            elements.append(t3)
            elements.append(Spacer(1, 6))

        # 6. Differential Diagnosis Callout for Clinicians
        differential_box = (
            "<b>CLINICIAN TRIAGE CHECKLIST:</b> Prior to confirming PCOS, 2023 international guidelines mandate excluding: "
            "(1) Thyroid dysfunction via TSH, (2) Hyperprolactinemia via Prolactin, and (3) Non-classic Congenital Adrenal Hyperplasia via 17-OHP. "
            "For adolescents (<8 years from menarche), ultrasound & AMH should NOT be used for diagnosis."
        )
        elements.append(Table(
            [[Paragraph(differential_box, ParagraphStyle("DiffStyle", fontName="Helvetica", fontSize=7.5, textColor=colors.HexColor("#78350F")))]],
            colWidths=[540],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), c_amber_bg),
                ("BOX", (0, 0), (-1, -1), 0.8, c_amber_border),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ])
        ))

        # Footer note
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=c_lavender, spaceBefore=4, spaceAfter=4))
        elements.append(Paragraph(
            "CycleAware Health Monitoring Platform | In compliance with India DPDP Act 2023 Data Minimization Principles | 2023 International PCOS Guidelines",
            ParagraphStyle("Footer", fontName="Helvetica", fontSize=6.5, textColor=c_slate, alignment=1)
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
