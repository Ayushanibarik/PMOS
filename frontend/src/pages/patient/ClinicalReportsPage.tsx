import React, { useEffect, useState } from 'react'
import { FileSpreadsheet, Upload, Trash2, Download, AlertTriangle, CheckCircle2, FileText, UserCheck } from 'lucide-react'
import { api } from '../../services/api'
import { LaboratoryResult, UploadedDocument } from '../../types'
import { LabScheduleWidget } from '../../components/clinical/LabScheduleWidget'
import { ConsultationRecalibrationModal } from '../../components/clinical/ConsultationRecalibrationModal'

const COMMON_TESTS = [
  { name: 'Total Testosterone', defaultUnit: 'ng/dL', sampleRef: '15 - 70 ng/dL' },
  { name: 'Free Testosterone', defaultUnit: 'pg/mL', sampleRef: '0.5 - 3.8 pg/mL' },
  { name: 'SHBG (Sex Hormone Binding Globulin)', defaultUnit: 'nmol/L', sampleRef: '18 - 144 nmol/L' },
  { name: 'DHEAS', defaultUnit: 'µg/dL', sampleRef: '65 - 380 µg/dL' },
  { name: 'AMH (Anti-Müllerian Hormone)', defaultUnit: 'ng/mL', sampleRef: '1.0 - 4.5 ng/mL' },
  { name: 'LH (Luteinizing Hormone)', defaultUnit: 'mIU/mL', sampleRef: 'Follicular: 2 - 12 mIU/mL' },
  { name: 'FSH (Follicle Stimulating Hormone)', defaultUnit: 'mIU/mL', sampleRef: 'Follicular: 3 - 10 mIU/mL' },
  { name: 'TSH (Thyroid Stimulating Hormone)', defaultUnit: 'mIU/L', sampleRef: '0.4 - 4.2 mIU/L' },
  { name: 'Prolactin', defaultUnit: 'ng/mL', sampleRef: '4.8 - 23.3 ng/mL' },
  { name: 'Fasting Glucose', defaultUnit: 'mg/dL', sampleRef: '70 - 99 mg/dL' },
  { name: 'HbA1c', defaultUnit: '%', sampleRef: '< 5.7%' },
  { name: '17-Hydroxyprogesterone (17-OHP)', defaultUnit: 'ng/dL', sampleRef: '< 200 ng/dL' }
]

export const ClinicalReportsPage: React.FC = () => {
  const [labs, setLabs] = useState<LaboratoryResult[]>([])
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [recalibrationOpen, setRecalibrationOpen] = useState(false)

  // Form State
  const [testName, setTestName] = useState('Total Testosterone')
  const [value, setValue] = useState<number | ''>('')
  const [unit, setUnit] = useState('ng/dL')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [labName, setLabName] = useState('')
  const [refRange, setRefRange] = useState('15 - 70 ng/dL')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const loadData = async () => {
    try {
      const [lData, dData] = await Promise.all([
        api.getLabs(),
        api.getDocuments()
      ])
      setLabs(lData)
      setDocuments(dData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTestChange = (name: string) => {
    setTestName(name)
    const match = COMMON_TESTS.find(t => t.name === name)
    if (match) {
      setUnit(match.defaultUnit)
      setRefRange(match.sampleRef)
    }
  }

  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (value === '') return
    setIsSubmitting(true)
    try {
      await api.createLab({
        test_name: testName,
        value: Number(value),
        unit,
        test_date: testDate,
        laboratory_name: labName || undefined,
        reference_range: refRange || undefined
      })
      setValue('')
      loadData()
    } catch (err: any) {
      alert(`Could not log result: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLab = async (id: string) => {
    if (!confirm('Delete this laboratory test entry?')) return
    try {
      await api.deleteLab(id)
      loadData()
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    setIsUploading(true)
    try {
      await api.uploadDocument(selectedFile)
      setSelectedFile(null)
      loadData()
    } catch (err: any) {
      alert(`Upload error: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8 text-left">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-plum-900">
            Clinical Laboratory Reports & Documents
          </h1>
          <p className="text-xs text-slate-500">
            Store laboratory test results and diagnostic documents. Results are securely preserved with full provenance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRecalibrationOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-rose-300" />
          <span>Doctor Consultation Outcome (Recalibration)</span>
        </button>
      </div>

      {/* U07 & U08: Laboratory & Imaging Scheduling Guardrails */}
      <LabScheduleWidget />

      {/* Safety Notice */}
      <div className="p-4 bg-plum-50/70 border border-plum-200 rounded-2xl text-xs space-y-1">
        <div className="font-bold text-plum-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Clinical Assay Notice</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Laboratory reference ranges vary significantly across assays, diagnostic platforms, and individual clinical laboratories.
          An isolated abnormal result (such as elevated testosterone or AMH) does NOT constitute a confirmed PCOS/PMOS diagnosis.
        </p>
      </div>

      {/* Grid: Lab Form (5 cols) + Document Upload (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lab Entry Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-plum-800" />
            <span>Record Structured Laboratory Test</span>
          </h2>

          <form onSubmit={handleSaveLab} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Test Name
              </label>
              <select
                value={testName}
                onChange={(e) => handleTestChange(e.target.value)}
                className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
              >
                {COMMON_TESTS.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reported Value *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 68.5"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Test Date *
                </label>
                <input
                  type="date"
                  required
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lab Reference Range
                </label>
                <input
                  type="text"
                  value={refRange}
                  onChange={(e) => setRefRange(e.target.value)}
                  placeholder="e.g., 15 - 70 ng/dL"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Laboratory / Hospital Name (Optional)
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="e.g., Metropolis / Apollo Diagnostics"
                className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Laboratory Result'}
            </button>
          </form>
        </div>

        {/* Document Upload & File Storage */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-plum-800" />
            <span>Upload Diagnostic PDF / Image</span>
          </h2>

          <form onSubmit={handleUploadFile} className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-ivory-300 rounded-2xl p-6 text-center hover:border-plum-400 transition-colors bg-ivory-50/50">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="doc-upload-input"
              />
              <label htmlFor="doc-upload-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 text-lavender-500 mx-auto" />
                <div className="font-semibold text-plum-900">
                  {selectedFile ? selectedFile.name : 'Click to select laboratory report'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Supported: PDF, JPG, PNG (Max 10MB)
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-subtle transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Securing & Uploading...' : 'Upload Document to Private Vault'}
            </button>
          </form>

          {/* Uploaded Documents List */}
          <div className="pt-2 space-y-2 text-xs">
            <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Uploaded Files ({documents.length})
            </div>
            {documents.length > 0 ? (
              <div className="space-y-1.5">
                {documents.map((d) => (
                  <div key={d.id} className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-plum-700 flex-shrink-0" />
                      <span className="font-semibold text-plum-900 truncate">{d.original_filename}</span>
                    </div>
                    <a
                      href={`/api/v1/clinical-records/documents/${d.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-500 hover:text-plum-800"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-4">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lab Results Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Structured Laboratory Results
        </h2>

        {labs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Test Name</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3">Lab Reference Range</th>
                  <th className="py-3 px-3">Laboratory</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {labs.map((l) => (
                  <tr key={l.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-3 font-semibold text-plum-900">{l.test_date}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{l.test_name}</td>
                    <td className="py-3 px-3 font-bold text-plum-800">{l.value} {l.unit}</td>
                    <td className="py-3 px-3 text-slate-500">{l.reference_range || '—'}</td>
                    <td className="py-3 px-3 text-slate-500">{l.laboratory_name || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteLab(l.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No laboratory test results recorded yet.
          </div>
        )}
      </div>

      {/* U10: Bayesian Recalibration Modal */}
      <ConsultationRecalibrationModal
        isOpen={recalibrationOpen}
        onClose={() => setRecalibrationOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  )
}

