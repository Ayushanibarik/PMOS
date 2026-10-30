import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Download, Trash2, CheckCircle2, AlertTriangle, Lock } from 'lucide-react'
import { api } from '../../services/api'

export const PrivacySettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [consents, setConsents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Consent states
  const [research, setResearch] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [reminders, setReminders] = useState(true)

  useEffect(() => {
    async function loadConsents() {
      try {
        const data = await api.getConsents()
        setConsents(data)
        const resConsent = data.find((c: any) => c.consent_type === 'research_participation')
        if (resConsent) setResearch(resConsent.is_granted)
        const anaConsent = data.find((c: any) => c.consent_type === 'product_analytics')
        if (anaConsent) setAnalytics(anaConsent.is_granted)
        const remConsent = data.find((c: any) => c.consent_type === 'reminders')
        if (remConsent) setReminders(remConsent.is_granted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadConsents()
  }, [])

  const handleSaveConsents = async () => {
    try {
      await api.updateConsents([
        { consent_type: 'service_delivery', is_granted: true },
        { consent_type: 'research_participation', is_granted: research },
        { consent_type: 'product_analytics', is_granted: analytics },
        { consent_type: 'reminders', is_granted: reminders },
      ])
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: any) {
      alert(`Save error: ${err.message}`)
    }
  }

  const handleExportJson = async () => {
    try {
      const data = await api.exportDataJson()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CycleAware_DataPrincipal_Export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Export failed: ${err.message}`)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await api.deleteAccount()
      api.logout()
      alert('Your account and all associated health records have been permanently erased.')
      navigate('/')
      window.location.reload()
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-1">
        <h1 className="font-serif text-2xl font-bold text-plum-900">
          Privacy, Consent & Data Governance
        </h1>
        <p className="text-xs text-slate-500">
          Full user control in accordance with India's Digital Personal Data Protection (DPDP) Act, 2023.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-sage-50 border border-sage-200 text-sage-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-600" />
          <span>Consent preferences updated and logged to audit trail.</span>
        </div>
      )}

      {/* Consent Toggles */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6 text-xs">
        <div>
          <h2 className="font-serif font-bold text-lg text-plum-900">
            Granular Consent Preferences
          </h2>
          <p className="text-slate-400 text-[11px]">
            Modify or withdraw non-essential processing consents at any time.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-plum-900 block">Core Service Delivery</span>
              <span className="text-[11px] text-slate-500">Required to store and display your personal menstrual cycles, symptoms, and measurements.</span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-sage-100 text-sage-800">
              Mandatory
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-ivory-300 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-plum-900 block">De-Identified Research Participation</span>
              <span className="text-[11px] text-slate-500">Allow anonymized, aggregated cycle parameters to contribute to female reproductive health science.</span>
            </div>
            <input
              type="checkbox"
              checked={research}
              onChange={(e) => setResearch(e.target.checked)}
              className="w-4 h-4 rounded text-plum-800"
            />
          </div>

          <div className="p-4 bg-white rounded-2xl border border-ivory-300 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-plum-900 block">Privacy-Safe Product Analytics</span>
              <span className="text-[11px] text-slate-500">Help improve platform navigation and performance. Health details are never included.</span>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="w-4 h-4 rounded text-plum-800"
            />
          </div>

          <div className="p-4 bg-white rounded-2xl border border-ivory-300 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-plum-900 block">Cycle & Log Reminders</span>
              <span className="text-[11px] text-slate-500">Receive gentle, neutral notifications to log dates as your cycle arrives.</span>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="w-4 h-4 rounded text-plum-800"
            />
          </div>
        </div>

        <button
          onClick={handleSaveConsents}
          className="px-5 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-subtle transition-colors"
        >
          Save Consent Preferences
        </button>
      </div>

      {/* Data Subject Rights (Portability & Erasure) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4 text-xs">
        <div>
          <h2 className="font-serif font-bold text-lg text-plum-900">
            Data Principal Rights (DPDP Act 2023)
          </h2>
          <p className="text-slate-400 text-[11px]">
            Exercise your statutory rights of data access, machine-readable portability, and account erasure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-plum-900 block">Machine-Readable Data Portability</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download your entire history (periods, symptoms, measurements, lab tests, sharing permissions) as a structured JSON archive.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-ivory-100 border border-ivory-300 text-slate-700 rounded-xl font-semibold transition-colors w-fit"
            >
              <Download className="w-3.5 h-3.5 text-plum-800" />
              <span>Export Complete JSON</span>
            </button>
          </div>

          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-rose-900 block">Permanent Account Erasure</span>
              <p className="text-[11px] text-rose-950/80 leading-relaxed">
                Permanently purge your account, profile, cycle history, and all stored health documents from our systems.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-subtle transition-colors w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-plum-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-ivory-300 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Confirm Account Erasure</span>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              This action is permanent and irreversible. All recorded menstrual cycles, symptom entries, physiological measurements, uploaded laboratory records, and clinician notes will be permanently deleted from our database.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-ivory-300 rounded-lg font-semibold text-slate-600 hover:bg-ivory-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-subtle disabled:opacity-50"
              >
                {isDeleting ? 'Erasing Data...' : 'Permanently Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

