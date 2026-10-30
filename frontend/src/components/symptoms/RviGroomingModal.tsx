import React, { useState } from 'react'
import { Sparkles, X, Calculator, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'
import { RviCalculationResponse } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RviGroomingModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [severity, setSeverity] = useState(3)
  const [modality, setModality] = useState('threading')
  const [daysElapsed, setDaysElapsed] = useState(7)
  const [itaAngle, setItaAngle] = useState(18.0) // Tan default for South Asian skin
  const [rviResult, setRviResult] = useState<RviCalculationResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const itaCategories = [
    { label: 'Very Light (>55°)', value: 60.0 },
    { label: 'Light (41° - 55°)', value: 48.0 },
    { label: 'Intermediate (28° - 41°)', value: 34.0 },
    { label: 'Tan (10° - 28°)', value: 18.0 },
    { label: 'Brown (-30° - 10°)', value: -5.0 },
    { label: 'Dark (<= -30°)', value: -40.0 }
  ]

  const handleCompute = async () => {
    setIsCalculating(true)
    try {
      const res = await api.calculateRvi({
        observed_severity: severity,
        grooming_modality: modality,
        days_since_grooming: Number(daysElapsed),
        ita_angle: itaAngle
      })
      setRviResult(res)
    } catch (err: any) {
      alert(`Calculation error: ${err.message}`)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSaveToJournal = async () => {
    if (!rviResult) return
    setIsSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.createSymptom({
        symptom_code: 'unwanted_facial_hair',
        symptom_name: 'Facial Hair Regrowth (RVI)',
        category: 'hair',
        severity: severity,
        date: today,
        grooming_modality: modality,
        days_since_grooming: daysElapsed,
        rvi_score: rviResult.rvi_score,
        notes: `Regrowth Velocity Index: ${rviResult.rvi_score} (${rviResult.growth_velocity_category}) following ${modality} (${daysElapsed}d ago).`
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

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
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-plum-900">Regrowth Velocity Index (RVI)</h3>
            <p className="text-xs text-slate-500">Cosmetic grooming compensation & melanin-aware contrast calibration</p>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-3 mb-4 text-xs text-slate-600">
          <p>
            Standard apps fail to account for regular cosmetic grooming (threading, waxing, laser).
            RVI mathematically normalizes observed hair visibility against time elapsed since grooming,
            providing accurate longitudinal velocity rather than misleading single-day snapshots.
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Cosmetic Grooming Modality
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-plum-500"
            >
              <option value="threading">Threading (Root epilated, epilation latency)</option>
              <option value="waxing">Waxing (Mechanical follicular disruption)</option>
              <option value="shaving">Shaving (Blunt surface cut; rapid reappearance)</option>
              <option value="plucking">Tweezing / Plucking</option>
              <option value="laser">Laser / Electrolysis</option>
              <option value="depilatory_cream">Depilatory Cream</option>
              <option value="none">No recent grooming</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Days Since Last Grooming
              </label>
              <input
                type="number"
                min={0}
                max={90}
                value={daysElapsed}
                onChange={(e) => setDaysElapsed(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Observed Regrowth Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
              >
                <option value={1}>1 - Barely visible fine stubble</option>
                <option value={2}>2 - Mild noticeable regrowth</option>
                <option value={3}>3 - Moderate coarse regrowth</option>
                <option value={4}>4 - Dense coarse regrowth</option>
                <option value={5}>5 - Severe rapid regrowth</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Inner-Wrist Skin Tone Calibration (ITA°)
            </label>
            <select
              value={itaAngle}
              onChange={(e) => setItaAngle(Number(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white font-medium"
            >
              {itaCategories.map((c) => (
                <option key={c.label} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 block mt-1">
              Calibrates computer vision contrast without ethnic assumptions.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCompute}
            disabled={isCalculating}
            className="w-full py-2.5 bg-plum-800 hover:bg-plum-900 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-4 h-4" />
            {isCalculating ? 'Computing Index...' : 'Calculate Regrowth Velocity (RVI)'}
          </button>
        </div>

        {rviResult && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-900 uppercase">Computed RVI Score</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  rviResult.growth_velocity_category === 'elevated'
                    ? 'bg-rose-600 text-white'
                    : (rviResult.growth_velocity_category === 'moderate'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white')
                }`}
              >
                {rviResult.growth_velocity_category}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-700 mb-1">
              {rviResult.rvi_score}
            </div>
            <p className="text-xs text-slate-700 mb-2">{rviResult.explanation}</p>
            <div className="text-[11px] text-slate-500 border-t border-rose-200 pt-2">
              <b>Scientific Disclaimer:</b> {rviResult.disclaimer}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 transition"
          >
            Close
          </button>
          {rviResult && (
            <button
              type="button"
              onClick={handleSaveToJournal}
              disabled={isSaving}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Log RVI Observation'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

