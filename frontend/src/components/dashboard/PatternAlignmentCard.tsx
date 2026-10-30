import React, { useState } from 'react'
import { Activity, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { PatternAlignmentIndex } from '../../types'

interface Props {
  pai?: PatternAlignmentIndex
}

export const PatternAlignmentCard: React.FC<Props> = ({ pai }) => {
  const [showDetails, setShowDetails] = useState(false)

  if (!pai) return null

  const isElevated = pai.alignment_level.includes('Elevated') || pai.pai_score >= 65
  const isModerate = pai.alignment_level.includes('Moderate') || pai.pai_score >= 35

  const getSummaryMessage = () => {
    if (isElevated) {
      return 'Some of your recorded symptoms and cycle changes overlap with patterns that may be worth discussing with a gynecologist.'
    }
    if (isModerate) {
      return 'A few recurring patterns have been observed across your recent cycle and symptom logs. Continuing to log will help provide clearer context.'
    }
    return 'Your recorded cycles and daily symptom logs align with typical ovulatory variation.'
  }

  const getStatusBadge = () => {
    if (isElevated) {
      return {
        label: 'Discussion Recommended',
        style: 'bg-rose-100 text-rose-800 border-rose-200'
      }
    }
    if (isModerate) {
      return {
        label: 'Mild Pattern Overlap',
        style: 'bg-amber-100 text-amber-800 border-amber-200'
      }
    }
    return {
      label: 'Aligned with Typical Variation',
      style: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  }

  const badge = getStatusBadge()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-plum-100 rounded-xl text-plum-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-plum-900">Hormonal Health & Pattern Overview</h3>
            <p className="text-xs text-slate-500">
              Personalized overview comparing longitudinal symptom records against evidence-informed health patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.style}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Main supportive plain-language summary */}
      <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 mb-4 text-sm text-slate-700 leading-relaxed">
        {getSummaryMessage()}
      </div>

      {/* Developmental or Contraceptive context notes */}
      {(pai.developmental_modifier || pai.contraceptive_modifier) && (
        <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-3 mb-4 text-xs text-plum-900 space-y-1">
          {pai.developmental_modifier && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-plum-600" />
              <span>{pai.developmental_modifier}</span>
            </p>
          )}
          {pai.contraceptive_modifier && (
            <p className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>{pai.contraceptive_modifier}</span>
            </p>
          )}
        </div>
      )}

      {/* Progressive Disclosure Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? 'Hide contributing health factors' : 'View contributing health factors'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetails && (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-100 animate-fade-in">
            {pai.axes.map((axis) => (
              <div key={axis.axis_name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {axis.axis_name}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {axis.raw_score >= 60 ? 'Notable pattern' : (axis.raw_score >= 30 ? 'Moderate' : 'Low overlap')}
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
        )}
      </div>

      {/* Non-alarmist Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2 mt-4">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{pai.disclaimer}</span>
      </div>
    </div>
  )
}
