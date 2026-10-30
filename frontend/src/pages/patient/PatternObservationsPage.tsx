import React, { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, BookOpen, Stethoscope } from 'lucide-react'
import { api } from '../../services/api'
import { ObservationSummary } from '../../types'

export const PatternObservationsPage: React.FC = () => {
  const [summary, setSummary] = useState<ObservationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadObservations() {
      try {
        const data = await api.getObservations()
        setSummary(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadObservations()
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Evaluating evidence-informed clinical guidelines...
      </div>
    )
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-1">
        <h1 className="font-serif text-2xl font-bold text-plum-900">
          Evidence-Informed Pattern Observations
        </h1>
        <p className="text-xs text-slate-500">
          Rule-based evaluations grounded in the 2023 International Evidence-Based Guideline for PCOS/PMOS.
        </p>
      </div>

      {/* Medical Safety Disclaimer Callout */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5">
        <div className="font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Non-Diagnostic Observation Notice</span>
        </div>
        <p className="text-rose-950/80 leading-relaxed text-[11px]">
          {summary?.disclaimer || 'Pattern observations highlight statistical and clinical guideline correlations. They DO NOT represent a medical diagnosis. Always consult a healthcare professional.'}
        </p>
      </div>

      {/* Observation Cards */}
      <div className="space-y-4">
        {summary?.observations && summary.observations.length > 0 ? (
          summary.observations.map((obs) => (
            <div
              key={obs.id}
              className={`p-6 rounded-3xl border shadow-subtle space-y-3 transition-colors ${
                obs.observation_type === 'follow_up_observation'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-white border-ivory-300'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                  obs.observation_type === 'follow_up_observation'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-plum-50 text-plum-800 border-plum-200'
                }`}>
                  {obs.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {obs.rule_version}
                </span>
              </div>

              <h2 className="font-serif font-bold text-lg text-plum-900">
                {obs.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {obs.description}
              </p>

              {/* Evidence Details */}
              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Clinical Evidence Basis
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  {obs.evidence_details}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-plum-50/50 rounded-xl border border-plum-100 text-xs space-y-1">
                <div className="text-[10px] font-bold text-plum-800 uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-plum-800" />
                  <span>Discussion Recommendation</span>
                </div>
                <div className="text-plum-900 text-[11px] font-medium leading-relaxed">
                  {obs.recommendation}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-ivory-300 text-center text-xs text-slate-400">
            No pattern flags detected. Your records align within reference bounds.
          </div>
        )}
      </div>

      {/* Evidence Source Citation Footer */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-2 text-xs text-slate-500">
        <div className="font-bold text-plum-900 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-plum-800" />
          <span>Clinical Reference Standard</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          {summary?.guideline_citation}
        </p>
      </div>
    </div>
  )
}

