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
        writer.writerow(["Date", "Category", "Symptom Name", "Severity (0-5)", "Notes"])
        for s in patient_data.get("symptoms", []):
            writer.writerow([
                s.get("date", ""),
                s.get("category", ""),
                s.get("symptom_name", ""),
                s.get("severity", ""),
                s.get("notes", "")
            ])
        writer.writerow([])

        # Measurements
        writer.writerow(["--- MEASUREMENTS ---"])
        writer.writerow(["Date", "Weight (kg)", "Height (cm)", "BMI", "Waist (cm)", "Resting HR", "BP (Sys/Dia)", "Sleep (hrs)"])
        for m in patient_data.get("measurements", []):
            bp = f"{m.get('systolic_bp', '')}/{m.get('diastolic_bp', '')}" if m.get('systolic_bp') else ""
            writer.writerow([
                m.get("date", ""),
                m.get("weight_kg", ""),
                m.get("height_cm", ""),
                m.get("bmi", ""),
                m.get("waist_cm", ""),
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
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Color definitions
        c_plum = colors.HexColor("#422B46")
        c_lavender = colors.HexColor("#A995BE")
        c_ivory = colors.HexColor("#FAF8F5")
        c_slate = colors.HexColor("#4D5663")
        c_rose = colors.HexColor("#C7909A")

        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=c_plum,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "ReportSub",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=c_slate,
            spaceAfter=12
        )
        disclaimer_style = ParagraphStyle(
            "ReportDisclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=colors.HexColor("#991B1B"),
            spaceAfter=8
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=c_plum,
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "ReportBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=c_slate,
            spaceAfter=4
        )

        elements = []

        # Header
        elements.append(Paragraph("CycleAware — Longitudinal Health Monitoring Summary", title_style))
        elements.append(Paragraph(
            f"Prepared for: <b>{patient_name}</b> | Generated on: {datetime.now(timezone.utc).strftime('%d %B %Y')} | Platform Ver: 1.0",
            subtitle_style
        ))
        
        # Medical Disclaimer Callout Box
        disclaimer_text = (
            "<b>IMPORTANT MEDICAL NOTICE:</b> This summary is a longitudinal self-monitoring record and statistical observation tool. "
            "It is <b>NOT A MEDICAL DIAGNOSIS</b> and does not replace evaluation by a qualified gynecologist or endocrinologist. "
            "Please bring this record to your clinical consultation."
        )
        elements.append(Table(
            [[Paragraph(disclaimer_text, disclaimer_style)]],
            colWidths=[540],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEE2E2")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#EF4444")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ])
        ))
        elements.append(Spacer(1, 10))

        # Cycle Analytics Summary Table
        analytics = patient_data.get("analytics", {})
        elements.append(Paragraph("1. Menstrual Cycle Statistics", section_style))
        
        cycle_table_data = [
            ["Total Cycles Recorded", f"{analytics.get('total_recorded_cycles', 0)}", "Average Cycle Length", f"{analytics.get('average_cycle_length', 'N/A')} days"],
            ["Median Cycle Length", f"{analytics.get('median_cycle_length', 'N/A')} days", "Length Variation (Std)", f"+/- {analytics.get('cycle_length_variation_std', 'N/A')} days"],
            ["Min / Max Cycle", f"{analytics.get('min_cycle_length', 'N/A')} - {analytics.get('max_cycle_length', 'N/A')} days", "Irregular Cycles Count", f"{analytics.get('irregular_cycles_count', 0)}"]
        ]
        t1 = Table(cycle_table_data, colWidths=[135, 135, 135, 135])
        t1.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), c_ivory),
            ("TEXTCOLOR", (0, 0), (-1, -1), c_slate),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 10))

        # Pattern Observations
        observations = patient_data.get("observations", [])
        if observations:
            elements.append(Paragraph("2. Evidence-Informed Pattern Observations", section_style))
            for obs in observations[:4]:
                obs_text = f"<b>{obs.get('title', '')}</b>: {obs.get('description', '')}<br/><i>Recommendation:</i> {obs.get('recommendation', '')}"
                elements.append(Paragraph(obs_text, body_style))
                elements.append(Spacer(1, 4))
            elements.append(Spacer(1, 8))

        # Recent Symptoms Table
        symptoms = patient_data.get("symptoms", [])
        if symptoms:
            elements.append(Paragraph("3. Frequently Recorded Symptoms", section_style))
            symp_rows = [["Date", "Category", "Symptom", "Severity (0-5)", "Notes"]]
            for s in symptoms[:6]:
                symp_rows.append([
                    s.get("date", ""),
                    s.get("category", ""),
                    s.get("symptom_name", ""),
                    f"{s.get('severity', 0)} / 5",
                    (s.get("notes") or "")[:30]
                ])
            t2 = Table(symp_rows, colWidths=[70, 80, 140, 80, 170])
            t2.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), c_plum),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            elements.append(t2)
            elements.append(Spacer(1, 10))

        # Laboratory Records
        labs = patient_data.get("lab_results", [])
        if labs:
            elements.append(Paragraph("4. Clinical Laboratory Results Supplied", section_style))
            lab_rows = [["Test Date", "Test Name", "Value", "Unit", "Lab Reference Range"]]
            for l in labs[:6]:
                lab_rows.append([
                    l.get("test_date", ""),
                    l.get("test_name", ""),
                    str(l.get("value", "")),
                    l.get("unit", ""),
                    l.get("reference_range", "N/A")
                ])
            t3 = Table(lab_rows, colWidths=[70, 170, 60, 60, 180])
            t3.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), c_plum),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEC9DE")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            elements.append(t3)
            elements.append(Spacer(1, 10))

        # Footer note
        elements.append(Spacer(1, 15))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=c_lavender, spaceBefore=5, spaceAfter=8))
        elements.append(Paragraph(
            "CycleAware Health Monitoring Platform | In compliance with India DPDP Act 2023 Principles | International Guidelines 2023",
            ParagraphStyle("Footer", fontName="Helvetica", fontSize=7, textColor=c_slate, alignment=1)
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
