import React from 'react'
import { ShieldAlert, AlertTriangle, Stethoscope } from 'lucide-react'

export const MedicalDisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Non-Diagnostic Positioning & Clinical Boundaries</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          Medical Safety & Clinical Disclaimer
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Please read this essential clinical disclaimer carefully before using the CycleAware platform.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
          <h2 className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>NOT A MEDICAL DIAGNOSIS OR PRESCRIPTION PLATFORM</span>
          </h2>
          <p className="text-rose-950/80 leading-relaxed">
            CycleAware is an early-pattern identification, longitudinal health-monitoring, and personal health record management tool.
            The platform <strong>DOES NOT DIAGNOSE</strong> Polycystic Ovary Syndrome (PCOS), Polycystic Ovarian Disease (PCOD), or Polycystic Metabolic Ovarian Syndrome (PMOS).
            It does not prescribe medication, recommend drug dosages, or guarantee fertility/ovulation outcomes.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="font-serif font-bold text-base text-plum-900">
            1. Five Distinct Categories of Information
          </h3>
          <p>
            CycleAware strictly distinguishes between:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>User-reported observations:</strong> Symptoms, self-reported bleeding dates, and notes entered by you.</li>
            <li><strong>Computed statistical trends:</strong> Mathematically calculated cycle lengths, medians, and variation intervals.</li>
            <li><strong>Algorithm-generated pattern flags:</strong> Configured reference thresholds derived from published 2023 international clinical guidelines.</li>
            <li><strong>Model-generated screening outputs:</strong> Experimental research scores, clearly identified as non-clinical prototypes.</li>
            <li><strong>Clinician-confirmed diagnoses:</strong> Official medical determinations made exclusively by licensed physicians following physical exam and clinical testing.</li>
          </ol>
        </section>

        <section className="space-y-3 pt-4 border-t border-ivory-200">
          <h3 className="font-serif font-bold text-base text-plum-900">
            2. Medical Device Regulatory Context (CDSCO & SaMD)
          </h3>
          <p>
            In accordance with the Central Drugs Standard Control Organization (CDSCO) Medical Device Software guidance and international Software as a Medical Device (SaMD) principles, this software is intended solely for wellness self-tracking, patient-recorded history management, and evidence-informed educational observation. It has not received formal regulatory clearance as an automated diagnostic device and must not be used as the sole basis for clinical management.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-ivory-200">
          <h3 className="font-serif font-bold text-base text-plum-900">
            3. Emergency Care Warning
          </h3>
          <p>
            If you experience severe sudden lower abdominal or pelvic pain, soaking through multiple sanitary pads per hour for several consecutive hours, fever with pelvic tenderness, or signs of pregnancy complications, <strong>seek immediate emergency medical care</strong>. Do not delay medical intervention to log data or wait for platform observations.
          </p>
        </section>
      </div>
    </div>
  )
}

