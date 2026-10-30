import React, { useEffect, useState } from 'react'
import { Share2, Plus, ShieldCheck, Trash2, Clock, CheckCircle2, Copy } from 'lucide-react'
import { api } from '../../services/api'
import { SharingPermission } from '../../types'

export const DoctorSharingPage: React.FC = () => {
  const [permissions, setPermissions] = useState<SharingPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Form State
  const [duration, setDuration] = useState(30)
  const [scope, setScope] = useState('full')
  const [clinicianEmail, setClinicianEmail] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const data = await api.getSharePermissions()
      setPermissions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createShareInvite({
        duration_days: duration,
        sharing_scope: scope,
        clinician_email: clinicianEmail || undefined
      })
      setShowInviteModal(false)
      loadData()
    } catch (err: any) {
      alert(`Could not create share code: ${err.message}`)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke access immediately? The clinician will no longer be able to view your records.')) return
    try {
      await api.revokeSharePermission(id)
      loadData()
    } catch (err: any) {
      alert(`Revoke failed: ${err.message}`)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-plum-900">
            Doctor Sharing & Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Securely grant authorized clinicians time-limited access to your structured health timeline.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4 text-rose-300" />
          <span>Generate Doctor Access Code</span>
        </button>
      </div>

      {/* Permissions List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Active Clinical Sharing Permissions
        </h2>

        {permissions.length > 0 ? (
          <div className="space-y-3">
            {permissions.map((p) => {
              const isExpired = new Date(p.valid_until) < new Date()
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                    p.is_revoked || isExpired
                      ? 'bg-ivory-50/50 border-ivory-200 text-slate-400 opacity-70'
                      : 'bg-white border-ivory-300 text-slate-700 shadow-subtle'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-plum-900">
                        {p.access_code}
                      </span>
                      {p.is_revoked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          Revoked
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ivory-200 text-slate-600">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sage-50 text-sage-700 border border-sage-200">
                          Active Access
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Scope: <strong className="capitalize">{p.sharing_scope}</strong> • Valid until: {p.valid_until.split('T')[0]}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!p.is_revoked && !isExpired && (
                      <>
                        <button
                          onClick={() => copyToClipboard(p.access_code)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-ivory-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-ivory-100"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedCode === p.access_code ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                        <button
                          onClick={() => handleRevoke(p.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                        >
                          Revoke Access
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No active sharing permissions. Generate a code above to share records with your clinician.
          </div>
        )}
      </div>

      {/* Security & Access Protection Notice */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-2 text-xs text-slate-600">
        <h3 className="font-serif font-bold text-sm text-plum-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-plum-800" />
          <span>Patient-Controlled Privacy Invariant</span>
        </h3>
        <p className="leading-relaxed text-[11px]">
          Clinicians can never view your records without an active, unrevoked access code. Clinicians cannot alter your original entries; consultation assessments and recommendations are appended as distinct clinical review notes.
        </p>
      </div>

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-plum-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-ivory-300 text-left">
            <h3 className="font-serif font-bold text-lg text-plum-900 pb-3 border-b border-ivory-200 mb-4">
              Generate Clinician Access Code
            </h3>

            <form onSubmit={handleCreateInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Days)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
                >
                  <option value={7}>7 Days (Single consultation)</option>
                  <option value={30}>30 Days (Follow-up review)</option>
                  <option value={60}>60 Days (Extended review)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sharing Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
                >
                  <option value="full">Full Health History (Cycles, Symptoms, Labs, Measurements)</option>
                  <option value="cycles_only">Cycles Only</option>
                  <option value="labs_only">Laboratory Records Only</option>
                  <option value="summary_only">Statistical Summary Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinician Email (Optional)
                </label>
                <input
                  type="email"
                  value={clinicianEmail}
                  onChange={(e) => setClinicianEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-ivory-300 rounded-lg font-semibold text-slate-600 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-lg font-semibold shadow-subtle"
                >
                  Generate Access Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
