import React from 'react'
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react'
import { BetaDriftInfo } from '../../types'

interface Props {
  betaDrift?: BetaDriftInfo
}

export const BetaDriftCard: React.FC<Props> = ({ betaDrift }) => {
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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lavender-100 text-plum-800 rounded-xl">
            {getTrendIcon(betaDrift.trend_direction)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-plum-900">
              Longitudinal Multi-Cycle Drift (β_drift)
            </h4>
            <p className="text-xs text-slate-500">
              Statistical slope across {betaDrift.cycles_evaluated} consecutive cycles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getBadgeStyle(betaDrift.trend_direction)}`}>
            {getTrendIcon(betaDrift.trend_direction)}
            {betaDrift.trend_direction === 'lengthening' ? 'Lengthening Trend' : (betaDrift.trend_direction === 'shortening' ? 'Shortening Trend' : (betaDrift.trend_direction === 'stable' ? 'Stable Pattern' : 'More History Needed'))}
          </span>
          {betaDrift.beta_drift_slope !== null && betaDrift.beta_drift_slope !== undefined && (
            <span className="text-base font-extrabold text-plum-900">
              {betaDrift.beta_drift_slope > 0 ? `+${betaDrift.beta_drift_slope}` : betaDrift.beta_drift_slope} d/cycle
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        {betaDrift.explanation}
      </p>

      {betaDrift.is_outlier_detected && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Potential data anomaly (&gt;120d or &lt;15d) detected in record; robust filtering applied to prevent statistical distortion.</span>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{betaDrift.scientific_disclaimer}</span>
      </div>
    </div>
  )
}

