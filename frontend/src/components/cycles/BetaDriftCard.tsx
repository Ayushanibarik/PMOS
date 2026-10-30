import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { BetaDriftInfo } from '../../types'

interface Props {
  betaDrift?: BetaDriftInfo
}

export const BetaDriftCard: React.FC<Props> = ({ betaDrift }) => {
  const [showStats, setShowStats] = useState(false)

  if (!betaDrift) return null

  const getTrendIcon = (direction: string) => {
    if (direction === 'lengthening') return <TrendingUp className="w-4 h-4 text-rose-600" />
    if (direction === 'shortening') return <TrendingDown className="w-4 h-4 text-blue-600" />
    return <Minus className="w-4 h-4 text-emerald-600" />
  }

  const getBadgeStyle = (direction: string) => {
    if (direction === 'lengthening') return 'bg-rose-100 text-rose-800 border-rose-200'
    if (direction === 'shortening') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (direction === 'stable') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getFriendlyStatus = (direction: string) => {
    if (direction === 'lengthening') return 'Gradual Lengthening Observed'
    if (direction === 'shortening') return 'Gradual Shortening Observed'
    if (direction === 'stable') return 'Consistent Cycle Intervals'
    return 'More Cycle History Needed'
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lavender-100 text-plum-800 rounded-xl">
            {getTrendIcon(betaDrift.trend_direction)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-plum-900">
              Cycle Length Variation Over Time
            </h4>
            <p className="text-xs text-slate-500">
              Evaluates stability across your last {betaDrift.cycles_evaluated} recorded cycles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getBadgeStyle(betaDrift.trend_direction)}`}>
            {getTrendIcon(betaDrift.trend_direction)}
            <span>{getFriendlyStatus(betaDrift.trend_direction)}</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-700 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
        {betaDrift.explanation}
      </p>

      {/* Progressive Disclosure for Detailed Statistical Parameters */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="text-xs font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-1 transition-colors"
        >
          <span>{showStats ? 'Hide statistical measurements' : 'View statistical measurements'}</span>
          {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showStats && (
          <div className="mt-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-2 animate-fade-in">
            <div className="flex justify-between items-center text-slate-600">
              <span>Estimated Drift Slope:</span>
              <span className="font-mono font-bold text-plum-900">
                {betaDrift.beta_drift_slope !== null && betaDrift.beta_drift_slope !== undefined
                  ? (betaDrift.beta_drift_slope > 0 ? `+${betaDrift.beta_drift_slope}` : `${betaDrift.beta_drift_slope}`) + ' days / cycle'
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Evaluated Sequence:</span>
              <span className="font-medium text-slate-800">{betaDrift.cycles_evaluated} consecutive cycles</span>
            </div>
            {betaDrift.is_outlier_detected && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>One or more atypical cycle lengths were filtered to avoid skewing your long-term average.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-start gap-1.5 mt-3">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{betaDrift.scientific_disclaimer}</span>
      </div>
    </div>
  )
}
