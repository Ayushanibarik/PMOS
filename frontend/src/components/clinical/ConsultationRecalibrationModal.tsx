import React, { useState } from 'react'
import { Stethoscope, X, CheckCircle2, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react'
import { api } from '../../services/api'
import { ConsultationOutcome } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ConsultationRecalibrationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [doctorName, setDoctorName] = useState('Dr. S. Sharma, MD (Ob/Gyn)')
  const [status, setStatus] = useState('confirmed_pcos')
  const [differential, setDifferential] = useState('')
  const [investigations, setInvestigations] = useState('')
  const [notes, setNotes] = useState('')
  const [outcomeResult, setOutcomeResult] = useState<ConsultationOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await api.recordConsultationOutcome({
        consultation_date: date,
        clinician_name_or_id: doctorName,
        diagnosis_status: status,
        differential_diagnosis: differential || undefined,
        prescribed_investigations: investigations || undefined,
        clinical_notes: notes || undefined
      })
      setOutcomeResult(res)
      onSuccess()
    } catch (err: any) {
      alert(`Could not record outcome: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRollback = async () => {
    if (!outcomeResult) return
    setIsRollingBack(true)
    try {
      await api.rollbackRecalibration(outcomeResult.id)
      alert('Recalibration successfully rolled back to baseline.')
      setOutcomeResult(null)
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`)
    } finally {
      setIsRollingBack(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-plum-100 rounded-xl text-plum-700">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-plum-900">Post-Consultation Feedback Loop</h3>
            <p className="text-xs text-slate-500">Bayesian closed-loop personalized baseline recalibration (U10)</p>
          </div>
        </div>

        {!outcomeResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Consultation Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinician / Clinic Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Clinician-Confirmed Consultation Outcome
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-plum-500"
              >
                <option value="confirmed_pcos">Confirmed PCOS by Clinician (Rotterdam / 2023 Criteria)</option>
                <option value="pcos_ruled_out">PCOS Ruled Out (Normal ovulatory cycles confirmed)</option>
                <option value="differential_identified">Alternative Diagnosis Identified (TSH/Prolactin/NCAH)</option>
                <option value="normal_ovulation">Spontaneous Ovulation Verified (Progesterone confirmed)</option>
                <option value="inconclusive">Inconclusive / Pending Further Investigations</option>
              </select>
            </div>

            {status === 'differential_identified' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Identified Alternative Pathology
                </label>
                <select
                  value={differential}
                  onChange={(e) => setDifferential(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="">Select diagnosed condition...</option>
                  <option value="hypothyroidism">Hypothyroidism (TSH elevated)</option>
                  <option value="hyperprolactinemia">Hyperprolactinemia (Prolactin elevated)</option>
                  <option value="ncah">Non-Classic Congenital Adrenal Hyperplasia (17-OHP elevated)</option>
                  <option value="fha">Functional Hypothalamic Amenorrhea (Stress/weight related)</option>
                  <option value="normal_variation">Normal Pubertal / Physiological Variation</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Prescribed Investigations / Plan
              </label>
              <input
                type="text"
                value={investigations}
                onChange={(e) => setInvestigations(e.target.value)}
                placeholder="e.g. Day 3 Follicular blood draw, Pelvic TAS with full bladder"
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Doctor's Clinical Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Doctor's recommendations, lifestyle advice, or medication instructions..."
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium resize-none h-20"
              />
            </div>

            <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-3 text-xs text-slate-600">
              <b>Bayesian Safety Guarantee:</b> Recalibration adjusts only your individual longitudinal monitoring baseline;
              it does NOT retrain the core platform model or alter global clinical guidelines. Full audit rollback is supported.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-plum-800 hover:bg-plum-900 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Recalibrating...' : 'Record Outcome & Recalibrate'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">
                Personal Baseline Recalibrated Successfully
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Your longitudinal tracking thresholds have been updated via Bayesian likelihood ratio ({outcomeResult.likelihood_ratio}x).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Prior PAI Score</span>
                <span className="text-xl font-bold text-slate-700">{outcomeResult.prior_alignment_score}%</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-500 block">Posterior PAI Score</span>
                <span className="text-xl font-bold text-plum-900">{outcomeResult.posterior_alignment_score}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleRollback}
                disabled={isRollingBack}
                className="px-4 py-2 border border-rose-300 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-50 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isRollingBack ? 'Reverting...' : 'Rollback Recalibration'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-plum-800 text-white text-xs font-semibold rounded-xl hover:bg-plum-900 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

