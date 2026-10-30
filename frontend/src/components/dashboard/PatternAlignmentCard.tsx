import React from 'react'
import { Activity, Info, ShieldCheck, ChevronRight } from 'lucide-react'
import { PatternAlignmentIndex } from '../../types'

interface Props {
  pai?: PatternAlignmentIndex
}

export const PatternAlignmentCard: React.FC<Props> = ({ pai }) => {
  if (!pai) return null

  const getBadgeColor = (level: string) => {
    if (level.includes('Elevated')) return 'bg-rose-100 text-rose-800 border-rose-300'
    if (level.includes('Moderate')) return 'bg-amber-100 text-amber-800 border-amber-300'
    return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }

  const getScoreColor = (score: number) => {
    if (score >= 65) return 'text-rose-600'
    if (score >= 35) return 'text-amber-600'
    return 'text-emerald-600'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-plum-100 rounded-xl text-plum-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-plum-900">Pattern Alignment Index (PAI)</h3>
            <p className="text-xs text-slate-500">
              Evidence-informed multi-axial concordance with 2023 international guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(pai.alignment_level)}`}>
            {pai.alignment_level}
          </span>
          <div className="text-right">
            <span className={`text-2xl font-extrabold ${getScoreColor(pai.pai_score)}`}>
              {pai.pai_score}
            </span>
            <span className="text-xs text-slate-400 font-semibold"> / 100</span>
          </div>
        </div>
      </div>

      {/* Developmental or Contraceptive Modifiers */}
      {(pai.developmental_modifier || pai.contraceptive_modifier) && (
        <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-3 mb-4 text-xs text-plum-900 space-y-1">
          {pai.developmental_modifier && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-plum-600" />
              {pai.developmental_modifier}
            </p>
          )}
          {pai.contraceptive_modifier && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              {pai.contraceptive_modifier}
            </p>
          )}
        </div>
      )}

      {/* Axis Breakdown Waterfall */}
      <div className="space-y-3 mb-4">
        {pai.axes.map((axis) => (
          <div key={axis.axis_name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {axis.axis_name} <span className="text-slate-400 font-normal">({axis.weight_pct}% wt)</span>
              </span>
              <span className="font-bold text-plum-800">
                +{axis.weighted_contribution} pts <span className="text-slate-400 font-normal">({axis.raw_score}/100)</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-plum-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, axis.raw_score)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{axis.description}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{pai.disclaimer}</span>
      </div>
    </div>
  )
}

