import React from 'react'
import { Activity, AlertCircle, Info, ShieldAlert } from 'lucide-react'
import { BodyMeasurement } from '../../types'

interface Props {
  latestMeasurement?: BodyMeasurement
  isBodyNeutralMode?: boolean
}

export const SouthAsianMetabolicCard: React.FC<Props> = ({ latestMeasurement, isBodyNeutralMode }) => {
  if (!latestMeasurement) return null

  const bmi = latestMeasurement.bmi
  const whtr = latestMeasurement.waist_to_height_ratio || (
    latestMeasurement.waist_cm && latestMeasurement.height_cm
      ? Number((latestMeasurement.waist_cm / latestMeasurement.height_cm).toFixed(2))
      : undefined
  )
  const neck = latestMeasurement.neck_circumference_cm
  const slump = latestMeasurement.postprandial_slump_score

  const getBmiBadge = (val?: number) => {
    if (!val) return null
    if (val >= 27.5) return { label: 'High Risk (Obese: >= 27.5)', color: 'bg-rose-100 text-rose-800 border-rose-300' }
    if (val >= 23.0) return { label: 'Increased Risk (Overweight: >= 23.0)', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    if (val < 18.5) return { label: 'Underweight (< 18.5)', color: 'bg-blue-100 text-blue-800 border-blue-300' }
    return { label: 'Normal (18.5 - 22.9)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
  }

  const bmiInfo = getBmiBadge(bmi)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-plum-900">
              South Asian Metabolic Phenotype & "Thin-Fat" Risk Context
            </h4>
            <p className="text-xs text-slate-500">
              Tailored screening thresholds (WHO / ICMR Asian Indian Consensus)
            </p>
          </div>
        </div>

        {bmiInfo && !isBodyNeutralMode && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${bmiInfo.color}`}>
            {bmiInfo.label}
          </span>
        )}
      </div>

      {/* Phenotype Educational Explanation */}
      <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 mb-4 text-xs text-slate-700">
        <p>
          South Asian populations frequently exhibit a <b>"thin-fat" phenotype</b>—characterized by higher visceral adiposity
          and elevated insulin resistance risk at lower absolute BMI levels compared to Western cohorts.
          Waist-to-Height Ratio (WHtR) and central circumference provide more sensitive cardiometabolic screening.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* BMI Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
            Asian-Indian BMI Cutoff (23.0)
          </span>
          <div className="text-xl font-extrabold text-plum-900">
            {isBodyNeutralMode ? (
              <span className="text-sm text-slate-500 font-medium">Body-Neutral Mode</span>
            ) : (
              bmi ? `${bmi} kg/m²` : 'Not recorded'
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Overweight cutoff: 23.0 (vs 25.0 Western)
          </span>
        </div>

        {/* WHtR Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
            Waist-to-Height Ratio (WHtR)
          </span>
          <div className="text-xl font-extrabold text-plum-900">
            {whtr !== undefined ? whtr : 'Not recorded'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Cardiometabolic screening cutoff: &lt; 0.50
          </span>
        </div>

        {/* Neck Circumference Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
            Neck Circumference
          </span>
          <div className="text-xl font-extrabold text-plum-900">
            {neck ? `${neck} cm` : 'Not recorded'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Upper-body adiposity cutoff: &lt; 34.0 cm
          </span>
        </div>
      </div>

      {slump !== undefined && slump !== null && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <b>Postprandial Energy Slump: {slump}/5</b>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Subjective meal-related fatigue can correlate with reactive insulin spikes.
              Standard Oral Glucose Tolerance Testing (OGTT) or HOMA-IR is required for clinical diagnosis.
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Anthropometric indicators are non-diagnostic screening proxies. They do not constitute a diagnosis of metabolic syndrome or PCOS.
        </span>
      </div>
    </div>
  )
}
