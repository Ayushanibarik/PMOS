import React, { useEffect, useState } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { api } from '../../services/api'
import { MenstrualPeriod, CycleAnalytics } from '../../types'
import { BetaDriftCard } from '../../components/cycles/BetaDriftCard'

export const CycleTrackerPage: React.FC = () => {
  const [periods, setPeriods] = useState<MenstrualPeriod[]>([])
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)

  // Calendar state: Current viewing month
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)) // Oct 2026

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [flow, setFlow] = useState('medium')
  const [spotting, setSpotting] = useState(false)
  const [notes, setNotes] = useState('')

  const loadData = async () => {
    try {
      const [pData, aData] = await Promise.all([
        api.getPeriods(),
        api.getCycleAnalytics()
      ])
      setPeriods(pData)
      setAnalytics(aData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this period entry?')) return
    try {
      await api.deletePeriod(id)
      loadData()
    } catch (err: any) {
      alert(`Could not delete: ${err.message}`)
    }
  }

  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createPeriod({
        start_date: startDate,
        end_date: endDate || undefined,
        flow_intensity: flow,
        has_spotting: spotting,
        notes: notes || undefined
      })
      setShowLogModal(false)
      loadData()
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  // Calendar calculation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-plum-900">
            Menstrual Cycle Tracker & Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Log period dates, visualize ovulatory intervals, and monitor cycle-to-cycle variation.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4 text-rose-300" />
          <span>Log New Period</span>
        </button>
      </div>

      {/* U02: Rolling Beta-Drift Trend Indicator */}
      <BetaDriftCard />

      {/* Calendar Component */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-ivory-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-plum-800" />
            <h2 className="font-serif font-bold text-xl text-plum-900">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 border border-ivory-300 rounded-lg text-slate-500 hover:bg-ivory-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 border border-ivory-300 rounded-lg text-slate-500 hover:bg-ivory-100"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 bg-ivory-50/50 rounded-xl" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

            // Check if day is period start
            const periodEntry = periods.find((p) => p.start_date === dateStr)
            
            // Check if within bleeding span
            const isInBleedingSpan = periods.some((p) => {
              if (!p.end_date) return p.start_date === dateStr
              return dateStr >= p.start_date && dateStr <= p.end_date
            })

            // Check if within predicted window
            const predWindow = analytics?.prediction
            const isInPrediction = predWindow?.window_start_date && predWindow?.window_end_date &&
              dateStr >= predWindow.window_start_date && dateStr <= predWindow.window_end_date

            return (
              <div
                key={dayNum}
                className={`h-16 sm:h-20 p-2 rounded-xl border text-xs flex flex-col justify-between transition-colors ${
                  periodEntry
                    ? 'bg-rose-500 text-white border-rose-600 font-bold shadow-subtle'
                    : isInBleedingSpan
                    ? 'bg-rose-100 border-rose-200 text-rose-900 font-semibold'
                    : isInPrediction
                    ? 'bg-plum-50 border-plum-200 text-plum-900 border-dashed'
                    : 'bg-white border-ivory-200 text-slate-700 hover:border-ivory-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{dayNum}</span>
                  {periodEntry && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                  {isInPrediction && !periodEntry && !isInBleedingSpan && (
                    <Sparkles className="w-3 h-3 text-lavender-500" />
                  )}
                </div>

                <div className="text-[10px] leading-tight truncate">
                  {periodEntry && (
                    <span>Period Day 1</span>
                  )}
                  {isInBleedingSpan && !periodEntry && (
                    <span className="text-rose-700">Bleeding</span>
                  )}
                  {isInPrediction && !periodEntry && !isInBleedingSpan && (
                    <span className="text-lavender-600">Predicted</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-ivory-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span>Period Start Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
            <span>Bleeding Span</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-plum-50 border border-plum-300 border-dashed" />
            <span>Statistical Prediction Window</span>
          </div>
        </div>
      </div>

      {/* Cycle Summaries Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-plum-900">
            Recorded Cycle History
          </h2>
          <p className="text-xs text-slate-400">
            Cycle lengths computed between consecutive period start dates
          </p>
        </div>

        {periods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Start Date</th>
                  <th className="py-3 px-3">End Date</th>
                  <th className="py-3 px-3">Flow</th>
                  <th className="py-3 px-3">Spotting</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {periods.map((p) => (
                  <tr key={p.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-3 font-semibold text-plum-900">{p.start_date}</td>
                    <td className="py-3 px-3 text-slate-600">{p.end_date || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-ivory-100 text-slate-700 font-medium">
                        {p.flow_intensity.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {p.has_spotting ? (
                        <span className="text-rose-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{p.notes || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No periods logged yet. Click "Log New Period" above to record your first entry.
          </div>
        )}
      </div>

      {/* Log Period Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-plum-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-ivory-300">
            <h3 className="font-serif font-bold text-lg text-plum-900 pb-3 border-b border-ivory-200 mb-4">
              Record Menstrual Period
            </h3>

            <form onSubmit={handleSavePeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flow Intensity
                </label>
                <select
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                >
                  <option value="very_light">Very Light</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                  <option value="very_heavy">Very Heavy</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spotting-modal"
                  checked={spotting}
                  onChange={(e) => setSpotting(e.target.checked)}
                  className="rounded text-plum-800"
                />
                <label htmlFor="spotting-modal" className="text-xs text-slate-700">
                  Includes spotting or irregular discharge
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-ivory-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-lg text-xs font-semibold shadow-subtle"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

