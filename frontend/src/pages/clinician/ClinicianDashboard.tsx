import React, { useEffect, useState } from 'react'
import { Stethoscope, ShieldCheck, Plus, Clock, FileText, Activity, Calendar, AlertTriangle, User, ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'
import { AuthorizedPatient } from '../../types'

export const ClinicianDashboard: React.FC = () => {
  const [patients, setPatients] = useState<AuthorizedPatient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [patientDetail, setPatientDetail] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)

  // Consultation Note Form
  const [consultDate, setConsultDate] = useState(new Date().toISOString().split('T')[0])
  const [generalNotes, setGeneralNotes] = useState('')
  const [cycleReview, setCycleReview] = useState('')
  const [symptomReview, setSymptomReview] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [referralStatus, setReferralStatus] = useState('none')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const loadPatients = async () => {
    try {
      const data = await api.getAuthorizedPatients()
      setPatients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleSelectPatient = async (id: string) => {
    setSelectedPatientId(id)
    try {
      const data = await api.getAuthorizedPatientDetail(id)
      setPatientDetail(data)
    } catch (err: any) {
      alert(`Could not load patient: ${err.message}`)
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setRedeemError(null)
    setRedeemSuccess(null)
    try {
      const res = await api.redeemInvite(redeemCode)
      setRedeemSuccess(res.message)
      setRedeemCode('')
      loadPatients()
    } catch (err: any) {
      setRedeemError(err.message)
    }
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return
    setIsSubmittingNote(true)
    try {
      await api.addClinicianNote({
        patient_id: selectedPatientId,
        consultation_date: consultDate,
        general_notes: generalNotes,
        cycle_review: cycleReview || undefined,
        symptom_review: symptomReview || undefined,
        recommendation,
        follow_up_date: followUpDate || undefined,
        referral_status: referralStatus
      })
      alert('Consultation note securely saved to clinical audit record.')
      setGeneralNotes('')
      setRecommendation('')
      const updated = await api.getAuthorizedPatientDetail(selectedPatientId)
      setPatientDetail(updated)
    } catch (err: any) {
      alert(`Could not save note: ${err.message}`)
    } finally {
      setIsSubmittingNote(false)
    }
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto px-4 py-8">
      {/* Clinician Portal Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-plum-900">
              Healthcare Professional Review Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Dedicated clinician workspace for reviewing patient-shared menstrual histories, symptom timelines, and lab assays.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-sage-800 bg-sage-50 px-3 py-1.5 rounded-xl border border-sage-200">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>Verified Clinician License: <strong>MCI-GYN-2018-84729</strong></span>
        </div>
      </div>

      {/* Main View: Patient List or Patient Deep Dive */}
      {!selectedPatientId ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Redeem Code Box (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
            <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-plum-800" />
              <span>Link Patient with Access Code</span>
            </h2>
            <p className="text-xs text-slate-500">
              Enter the patient-generated access code (e.g., CA-DEMO2026) to link their health timeline to your dashboard.
            </p>

            {redeemError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {redeemError}
              </div>
            )}
            {redeemSuccess && (
              <div className="p-3 bg-sage-50 text-sage-800 text-xs rounded-xl border border-sage-200">
                {redeemSuccess}
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="CA-XXXXXXX"
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700 uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
              >
                Authorize & Link Patient
              </button>
            </form>
          </div>

          {/* Authorized Patients List (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
              <h2 className="font-serif font-bold text-xl text-plum-900">
                Authorized Patients ({patients.length})
              </h2>
              <span className="text-[11px] text-slate-400">Time-limited access active</span>
            </div>

            {patients.length > 0 ? (
              <div className="space-y-3">
                {patients.map((p) => (
                  <div
                    key={p.patient_id}
                    onClick={() => handleSelectPatient(p.patient_id)}
                    className="p-4 bg-ivory-50 hover:bg-ivory-100/70 rounded-2xl border border-ivory-200 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-plum-900">
                          {p.full_name}
                        </span>
                        {p.irregular_cycles_flag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Ovulatory Irregularity
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Age: {p.age || '—'} • Scope: <span className="capitalize">{p.sharing_scope}</span> • Access valid until: {p.valid_until.split('T')[0]}
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-plum-800 text-white text-xs font-semibold rounded-lg shadow-subtle">
                      Review Records &rarr;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                No patients connected. Use the access code form to link a patient.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Patient Detailed Review View */
        <div className="space-y-6">
          <button
            onClick={() => { setSelectedPatientId(null); setPatientDetail(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-ivory-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-ivory-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient List</span>
          </button>

          {patientDetail ? (
            <div className="space-y-8">
              {/* Patient Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-plum-900">
                    {patientDetail.patient.full_name}
                  </h2>
                  <div className="text-xs text-slate-500 mt-1">
                    Age: {patientDetail.profile?.age} • Menarche Age: {patientDetail.profile?.menarche_age} • 
                    Self-Reported Regularity: <span className="capitalize font-semibold">{patientDetail.profile?.cycle_regularity_self_report}</span>
                  </div>
                </div>

                <div className="p-3 bg-plum-50 rounded-2xl text-xs text-plum-900">
                  Total Cycles Recorded: <strong>{patientDetail.analytics?.total_recorded_cycles}</strong> • 
                  Average Length: <strong>{patientDetail.analytics?.average_cycle_length}d</strong>
                </div>
              </div>

              {/* Grid: Cycles & Labs Review */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cycles */}
                <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-3">
                  <h3 className="font-serif font-bold text-base text-plum-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-plum-800" />
                    <span>Menstrual Cycles</span>
                  </h3>
                  <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                    {patientDetail.periods?.map((p: any) => (
                      <div key={p.id} className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-plum-900">{p.start_date}</span>
                          <span className="text-slate-400 text-[11px] ml-2">to {p.end_date || 'N/A'}</span>
                        </div>
                        <span className="capitalize px-2 py-0.5 rounded bg-white text-slate-700 font-medium text-[11px]">
                          {p.flow_intensity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labs */}
                <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-3">
                  <h3 className="font-serif font-bold text-base text-plum-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-plum-800" />
                    <span>Laboratory Tests Supplied</span>
                  </h3>
                  <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                    {patientDetail.labs?.map((l: any) => (
                      <div key={l.id} className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-plum-900">{l.test_name}</div>
                          <div className="text-[10px] text-slate-400">{l.test_date} • Ref: {l.reference_range || 'N/A'}</div>
                        </div>
                        <span className="font-bold text-plum-800 text-xs">
                          {l.value} {l.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation Note Composer */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
                <h3 className="font-serif font-bold text-xl text-plum-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sage-600" />
                  <span>Clinician Consultation Assessment & Notes</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Clinical impressions and follow-up recommendations are stored in a dedicated clinician record.
                </p>

                <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Consultation Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={consultDate}
                        onChange={(e) => setConsultDate(e.target.value)}
                        className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Recommended Referral
                      </label>
                      <select
                        value={referralStatus}
                        onChange={(e) => setReferralStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
                      >
                        <option value="none">No External Referral Needed</option>
                        <option value="pelvic_ultrasound">Pelvic Ultrasound Evaluation</option>
                        <option value="endocrinology">Endocrinology Specialist Consultation</option>
                        <option value="metabolic_panel">Comprehensive Metabolic / OGTT Panel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      General Clinical Notes *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="e.g., Patient reviewed with 6-month history of oligomenorrhea. Evaluated differential diagnoses..."
                      className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinical Recommendations & Management Plan *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      placeholder="e.g., Order 75g 2-hour OGTT. Continue lifestyle intervention..."
                      className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="px-6 py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-subtle disabled:opacity-50"
                  >
                    {isSubmittingNote ? 'Saving Clinical Assessment...' : 'Save Consultation Record'}
                  </button>
                </form>

                {/* Previous Notes */}
                {patientDetail.clinician_notes && patientDetail.clinician_notes.length > 0 && (
                  <div className="pt-6 border-t border-ivory-200 space-y-3">
                    <h4 className="font-bold text-sm text-plum-900">Historical Consultation Notes</h4>
                    <div className="space-y-2">
                      {patientDetail.clinician_notes.map((n: any) => (
                        <div key={n.id} className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs space-y-1">
                          <div className="flex justify-between items-center text-slate-400 text-[11px]">
                            <span>Date: {n.consultation_date}</span>
                            <span>Referral: <strong className="capitalize">{n.referral_status}</strong></span>
                          </div>
                          <p className="text-slate-700">{n.general_notes}</p>
                          <p className="text-plum-900 font-medium">Recommendation: {n.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">Loading patient records...</div>
          )}
        </div>
      )}
    </div>
  )
}
