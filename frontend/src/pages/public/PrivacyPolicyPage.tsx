import React from 'react'
import { ShieldCheck, Lock, Database, Trash2, FileCheck, CheckCircle2 } from 'lucide-react'

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-sage-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India DPDP Act 2023 & GDPR Privacy Framework</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          Privacy Policy & Data Principal Rights
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Reproductive and hormonal health records constitute highly sensitive personal data.
          CycleAware is designed around the highest privacy-by-design standards.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-plum-800" />
            <span>1. Core Data Principles</span>
          </h2>
          <p>
            In compliance with the <strong>Digital Personal Data Protection Act, 2023 (India)</strong> and international privacy standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Purpose Limitation:</strong> We process your cycle, symptom, and measurement records solely to provide you with personal health monitoring and statistical trend visualizations.</li>
            <li><strong>Data Minimization:</strong> We do not collect precise GPS locations, government IDs, or contact address books.</li>
            <li><strong>No Third-Party Advertising Trackers:</strong> Your intimate health data is never sold, brokered, or used for behavioral advertising targeting.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-plum-800" />
            <span>2. Granular, Unbundled Consent</span>
          </h2>
          <p>
            CycleAware maintains strictly separated consent options. You can use the core cycle tracker without consenting to optional research participation, product analytics, or clinician data sharing. Every consent record is versioned, timestamped, and can be withdrawn at any time.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-plum-800" />
            <span>3. Your Rights as a Data Principal</span>
          </h2>
          <div className="space-y-2">
            <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
              <strong className="text-plum-900 block">Right to Access and Portability:</strong>
              <span>You can download your entire health record at any time in both structured JSON (machine-readable) and standardized CSV formats via your Privacy Settings page.</span>
            </div>
            <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
              <strong className="text-plum-900 block">Right to Erasure (Account Deletion):</strong>
              <span>When you request account deletion, all associated periods, symptoms, measurements, lab records, and uploaded files are permanently deleted from our database with full cascading removal.</span>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-lg text-plum-900">
            4. Data Fiduciary & Grievance Redressal
          </h2>
          <p>
            For privacy inquiries, consent modifications, or to reach our designated Data Protection Officer, contact:
            <br />
            <span className="font-semibold text-plum-900">dpo@cycleaware.local</span>
          </p>
        </section>
      </div>
    </div>
  )
}
