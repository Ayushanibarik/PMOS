import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Calendar, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  FileText, 
  Plus, 
  Share2, 
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'
import { api } from '../../services/api'
import { CycleAnalytics, SymptomTrendItem, ObservationSummary } from '../../types'

export const PatientDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null)
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrendItem[]>([])
  const [observations, setObservations] = useState<ObservationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [aData, sData, oData] = await Promise.all([
          api.getCycleAnalytics(),
          api.getSymptomTrends(),
          api.getObservations()
        ])
        setAnalytics(aData)
        setSymptomTrends(sData)
        setObservations(oData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Loading personalized health records...
      </div>
    )
  }

  const cycleChartData = (analytics?.cycle_history || []).slice(0, 6).reverse().map((c, i) => ({
    name: `Cycle ${i + 1}`,
    length: c.cycle_length_days,
    irregular: c.is_irregular_by_guideline,
    date: c.cycle_start_date
  }))

  return (
    <div className="space-y-6 text-left">
      {/* Welcome & Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-plum-900">
              Health Monitoring Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage-700 border border-sage-200">
              Active Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Longitudinal menstrual records, symptom associations, and evidence-informed pattern recognition.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/app/cycles"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-300" />
            <span>Open Calendar</span>
          </Link>
          <a
            href="/api/v1/reports/download/pdf"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-plum-700" />
            <span>Export PDF</span>
          </a>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Cycles Logged
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {analytics?.total_recorded_cycles || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            {analytics?.has_sufficient_data ? 'Sufficient for trend analysis' : 'Min 3 cycles recommended'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Average Cycle Length
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {analytics?.average_cycle_length ? `${analytics.average_cycle_length}d` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            Median: {analytics?.median_cycle_length || '—'} days
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cycle Length Variation
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {analytics?.cycle_length_variation_std !== null ? `+/- ${analytics?.cycle_length_variation_std}d` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            Standard deviation across cycles
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Guideline Irregularity
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {analytics?.irregular_cycles_count || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            Cycles outside 21–35 day range
          </div>
        </div>
      </div>

      {/* Main Grid: Cycle Chart + Prediction / Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cycle Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-900">
                Cycle Length History
              </h2>
              <p className="text-xs text-slate-400">
                Grey dashed lines mark standard adult reference limits (21 to 35 days)
              </p>
            </div>
            <Link to="/app/cycles" className="text-xs font-semibold text-plum-800 hover:underline">
              View All &rarr;
            </Link>
          </div>

          {cycleChartData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBF2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#758091' }} tickLine={false} />
                  <YAxis domain={[15, 60]} tick={{ fontSize: 11, fill: '#758091' }} tickLine={false} unit="d" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #FAF8F5', fontSize: 11 }}
                    formatter={(val: any) => [`${val} days`, 'Cycle Length']}
                  />
                  <Bar
                    dataKey="length"
                    fill="#422B46"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No cycles recorded yet. Log two or more periods to visualize length trends.
            </div>
          )}

          <div className="p-3 bg-ivory-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span><strong>Guideline Assessment:</strong> {analytics?.guideline_status}</span>
            <span className="text-[10px] text-lavender-500">2023 International Guidelines</span>
          </div>
        </div>

        {/* Right: Predictions & Quick Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prediction Window Box */}
          <div className="bg-plum-900 text-ivory-100 p-6 rounded-3xl space-y-3 shadow-card">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <h3 className="font-serif font-bold text-base text-white">
                Next Period Window
              </h3>
            </div>

            {analytics?.prediction?.predicted_start_date ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-rose-200">
                  {analytics.prediction.predicted_start_date}
                </div>
                <div className="text-xs text-ivory-200">
                  Expected window: {analytics.prediction.window_start_date} to {analytics.prediction.window_end_date}
                </div>
                <div className="pt-2 text-[10px] text-ivory-300/80 leading-relaxed border-t border-plum-800">
                  {analytics.prediction.explanation}
                </div>
              </div>
            ) : (
              <div className="text-xs text-ivory-200/80 leading-relaxed">
                {analytics?.prediction?.explanation || 'Log at least 3 completed cycles to compute a statistical prediction window.'}
              </div>
            )}
          </div>

          {/* Pattern Observations Preview */}
          <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-plum-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Pattern Observations</span>
              </h3>
              <Link to="/app/observations" className="text-xs font-semibold text-plum-800 hover:underline">
                Details &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {observations?.observations && observations.observations.length > 0 ? (
                observations.observations.slice(0, 2).map((obs) => (
                  <div key={obs.id} className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-1">
                    <div className="font-bold text-plum-900">{obs.title}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {obs.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No observation flags detected in current tracking data.
                </div>
              )}
            </div>

            <div className="pt-1 text-[10px] text-slate-400">
              * Non-diagnostic. Discuss patterns with your physician.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Symptoms Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-plum-900">
              Frequently Recorded Symptoms
            </h2>
            <p className="text-xs text-slate-400">
              Observed frequencies across your longitudinal health journal
            </p>
          </div>
          <Link to="/app/symptoms" className="text-xs font-semibold text-plum-800 hover:underline">
            Manage Symptoms &rarr;
          </Link>
        </div>

        {symptomTrends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {symptomTrends.slice(0, 4).map((trend, i) => (
              <div key={i} className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-plum-900">{trend.symptom_name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                    {trend.frequency_count}x
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Category: <span className="capitalize">{trend.category}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Avg Severity: <strong>{trend.average_severity} / 5</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No symptoms recorded yet. Track daily symptoms to observe cycle associations.
          </div>
        )}
      </div>
    </div>
  )
}
