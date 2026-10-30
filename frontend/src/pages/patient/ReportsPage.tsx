import React from 'react'
import { FileText, Download, ShieldCheck, FileSpreadsheet, CheckCircle2 } from 'lucide-react'

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-1">
        <h1 className="font-serif text-2xl font-bold text-plum-900">
          Health Reports & Data Portability
        </h1>
        <p className="text-xs text-slate-500">
          Generate structured clinical summaries to take to your medical consultations or export your raw records.
        </p>
      </div>

      {/* PDF Report Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-plum-50 text-plum-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-900">
                Personal Health Monitoring Summary (PDF)
              </h2>
              <p className="text-xs text-slate-400">
                Comprehensive printable report formatted for clinical consultation
              </p>
            </div>
          </div>

          <a
            href="/api/v1/reports/download/pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-all"
          >
            <Download className="w-4 h-4 text-rose-300" />
            <span>Download PDF Report</span>
          </a>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="font-semibold text-plum-900">Included in this PDF report:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>Full Menstrual Cycle Length Statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>Symptom Frequency & Severity Tables</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>Supplied Laboratory Results & Provenance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>2023 Evidence-Informed Pattern Observations</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900">
          <strong>Non-Diagnostic Label:</strong> Every generated report prominently displays: <em>"Personal Health Monitoring Summary — Not a Medical Diagnosis"</em> to maintain clear clinical boundaries.
        </div>
      </div>

      {/* CSV Export Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-900">
                Raw Health Data Export (CSV)
              </h2>
              <p className="text-xs text-slate-400">
                Data portability export of all logged cycles, symptoms, measurements, and lab results
              </p>
            </div>
          </div>

          <a
            href="/api/v1/reports/export/csv"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-plum-700" />
            <span>Download CSV</span>
          </a>
        </div>
      </div>
    </div>
  )
}

