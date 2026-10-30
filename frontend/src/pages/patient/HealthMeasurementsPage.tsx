import React, { useEffect, useState } from 'react'
import { Scale, Plus, Trash2, Heart, Moon, Activity } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { api } from '../../services/api'
import { BodyMeasurement } from '../../types'

export const HealthMeasurementsPage: React.FC = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState<number | ''>(68.5)
  const [height, setHeight] = useState<number | ''>(162.0)
  const [waist, setWaist] = useState<number | ''>(84.0)
  const [restingHr, setRestingHr] = useState<number | ''>(72)
  const [sysBp, setSysBp] = useState<number | ''>(118)
  const [diaBp, setDiaBp] = useState<number | ''>(76)
  const [sleepHours, setSleepHours] = useState<number | ''>(7.0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const data = await api.getMeasurements()
      setMeasurements(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.createMeasurement({
        date,
        weight_kg: Number(weight) || undefined,
        height_cm: Number(height) || undefined,
        waist_cm: Number(waist) || undefined,
        resting_heart_rate: Number(restingHr) || undefined,
        systolic_bp: Number(sysBp) || undefined,
        diastolic_bp: Number(diaBp) || undefined,
        sleep_hours: Number(sleepHours) || undefined,
        data_source: 'self_reported'
      })
      loadData()
    } catch (err: any) {
      alert(`Could not log measurement: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this measurement entry?')) return
    try {
      await api.deleteMeasurement(id)
      loadData()
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  // Reverse for chronological chart
  const chartData = [...measurements].reverse().map(m => ({
    date: m.date,
    weight: m.weight_kg,
    waist: m.waist_cm,
    bmi: m.bmi
  }))

  const latest = measurements[0]

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-1">
        <h1 className="font-serif text-2xl font-bold text-plum-900">
          Physiological & Metabolic Measurements
        </h1>
        <p className="text-xs text-slate-500">
          Monitor weight dynamics, waist circumference, blood pressure, and sleep in relation to your cycles.
        </p>
      </div>

      {/* Latest Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Latest Weight
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {latest?.weight_kg ? `${latest.weight_kg} kg` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            BMI: {latest?.bmi ? `${latest.bmi} kg/m²` : '—'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Waist Circumference
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {latest?.waist_cm ? `${latest.waist_cm} cm` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            {latest?.waist_cm && latest.waist_cm >= 80 ? 'Threshold ≥ 80cm (South Asian)' : 'Within typical bounds'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Blood Pressure
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {latest?.systolic_bp && latest?.diastolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            Resting HR: {latest?.resting_heart_rate ? `${latest.resting_heart_rate} bpm` : '—'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sleep Duration
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {latest?.sleep_hours ? `${latest.sleep_hours} hrs` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">
            Reported average nightly sleep
          </div>
        </div>
      </div>

      {/* Grid: Form (5 cols) + Trend Chart (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Measurement Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>Record Measurement</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Waist Circumference (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : '')}
                placeholder="Around narrowest part of waist"
                className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Systolic BP
                </label>
                <input
                  type="number"
                  value={sysBp}
                  onChange={(e) => setSysBp(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 120"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diastolic BP
                </label>
                <input
                  type="number"
                  value={diaBp}
                  onChange={(e) => setDiaBp(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 80"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resting HR (bpm)
                </label>
                <input
                  type="number"
                  value={restingHr}
                  onChange={(e) => setRestingHr(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sleep Duration (hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Measurement'}
            </button>
          </form>
        </div>

        {/* Longitudinal Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-plum-800" />
            <span>Weight & Waist Circumference Trends</span>
          </h2>

          {chartData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBF2" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#758091' }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#758091' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #FAF8F5', fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#422B46" strokeWidth={2} name="Weight (kg)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="waist" stroke="#C7909A" strokeWidth={2} name="Waist (cm)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No measurements recorded yet.
            </div>
          )}

          <div className="p-3 bg-ivory-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            <strong>Clinical Safety Note:</strong> Body Mass Index (BMI) and weight measurements are physiological context indicators, not standalone diagnostic tests for PCOS/PMOS.
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Measurement Log History
        </h2>

        {measurements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Weight</th>
                  <th className="py-3 px-3">BMI</th>
                  <th className="py-3 px-3">Waist</th>
                  <th className="py-3 px-3">Blood Pressure</th>
                  <th className="py-3 px-3">Sleep</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-3 font-semibold text-plum-900">{m.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{m.weight_kg ? `${m.weight_kg} kg` : '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{m.bmi ? `${m.bmi}` : '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{m.waist_cm ? `${m.waist_cm} cm` : '—'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {m.systolic_bp && m.diastolic_bp ? `${m.systolic_bp}/${m.diastolic_bp}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.sleep_hours ? `${m.sleep_hours} hrs` : '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete log"
                        aria-label="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No measurements recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
