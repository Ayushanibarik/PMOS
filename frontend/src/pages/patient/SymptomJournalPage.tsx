import React, { useEffect, useState } from 'react'
import { Activity, Plus, Trash2, TrendingUp, TrendingDown, Minus, Mic, Scissors } from 'lucide-react'
import { api } from '../../services/api'
import { SymptomEntry, SymptomCatalogueItem, SymptomTrendItem } from '../../types'
import { VernacularVoiceModal } from '../../components/symptoms/VernacularVoiceModal'
import { RviGroomingModal } from '../../components/symptoms/RviGroomingModal'

export const SymptomJournalPage: React.FC = () => {
  const [entries, setEntries] = useState<SymptomEntry[]>([])
  const [catalogue, setCatalogue] = useState<SymptomCatalogueItem[]>([])
  const [trends, setTrends] = useState<SymptomTrendItem[]>([])
  const [loading, setLoading] = useState(true)

  // Advanced Modals
  const [vernacularModalOpen, setVernacularModalOpen] = useState(false)
  const [rviModalOpen, setRviModalOpen] = useState(false)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('skin')
  const [selectedCode, setSelectedCode] = useState('facial_acne')
  const [severity, setSeverity] = useState(3)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [eData, cData, tData] = await Promise.all([
        api.getSymptoms(),
        api.getSymptomCatalogue(),
        api.getSymptomTrends()
      ])
      setEntries(eData)
      setCatalogue(cData)
      setTrends(tData)

      // Set initial code matching category
      const firstInCat = cData.find(c => c.category === 'skin')
      if (firstInCat) setSelectedCode(firstInCat.code)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    const firstInCat = catalogue.find(c => c.category === cat)
    if (firstInCat) setSelectedCode(firstInCat.code)
  }

  const handleSaveSymptom = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const item = catalogue.find(c => c.code === selectedCode)
    try {
      await api.createSymptom({
        symptom_code: selectedCode,
        symptom_name: item ? item.name : selectedCode,
        category: selectedCategory,
        severity,
        date,
        notes: notes || undefined
      })
      setNotes('')
      loadData()
    } catch (err: any) {
      alert(`Could not log symptom: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this symptom log?')) return
    try {
      await api.deleteSymptom(id)
      loadData()
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const severityLabels = [
    'None / Absent',
    'Mild (Barely noticeable)',
    'Moderate (Noticeable)',
    'Significant (Interferes slightly)',
    'Severe (Uncomfortable)',
    'Very Severe (Disruptive)'
  ]

  const filteredCatalogue = catalogue.filter(c => c.category === selectedCategory)

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-plum-900">
            Symptom Journal & Association Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Track recurring skin, hair, metabolic, and wellbeing signs to observe associations across your cycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* U03: Vernacular Voice NLP */}
          <button
            type="button"
            onClick={() => setVernacularModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span>Voice / Vernacular (Hindi/Tamil)</span>
          </button>

          {/* U06: RVI Grooming Compensation */}
          <button
            type="button"
            onClick={() => setRviModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-rose-300" />
            <span>Hair Regrowth & Grooming Log</span>
          </button>
        </div>
      </div>

      {/* Log Form + Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Log Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>Record Symptom Entry</span>
          </h2>

          <form onSubmit={handleSaveSymptom} className="space-y-4">
            {/* Category Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                {['skin', 'hair', 'metabolic', 'menstrual', 'wellbeing'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-1.5 px-2 rounded-lg capitalize border transition-colors ${
                      selectedCategory === cat
                        ? 'bg-plum-800 text-white border-plum-800'
                        : 'bg-ivory-50 text-slate-600 border-ivory-200 hover:bg-ivory-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Symptom
              </label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
              >
                {filteredCatalogue.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Severity ({severity} / 5)
                </label>
                <span className="text-[11px] font-semibold text-rose-600">
                  {severityLabels[severity]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-plum-800 cursor-pointer"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific location, trigger, or details..."
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Save Symptom Entry'}
            </button>
          </form>
        </div>

        {/* Longitudinal Trends Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-plum-800" />
              <span>Symptom Frequency & Longitudinal Trends</span>
            </h2>
            <span className="text-[11px] text-slate-400">Descriptive associations</span>
          </div>

          {trends.length > 0 ? (
            <div className="space-y-3">
              {trends.map((t, i) => (
                <div key={i} className="p-3.5 bg-ivory-50 rounded-2xl border border-ivory-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-plum-900">{t.symptom_name}</div>
                    <div className="text-[11px] text-slate-500">
                      Category: <span className="capitalize">{t.category}</span> • Average Severity: {t.average_severity} / 5
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-bold text-xs">
                        {t.frequency_count} entries
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {t.recent_trend === 'increasing' && <span title="Increasing frequency"><TrendingUp className="w-4 h-4 text-rose-500" /></span>}
                      {t.recent_trend === 'decreasing' && <span title="Decreasing frequency"><TrendingDown className="w-4 h-4 text-sage-600" /></span>}
                      {t.recent_trend === 'stable' && <span title="Stable frequency"><Minus className="w-4 h-4 text-slate-400" /></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No trends detected yet. Record symptoms regularly to view frequency analyses.
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries History List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Recent Logged Entries
        </h2>

        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Symptom</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-3 font-semibold text-plum-900">{e.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{e.symptom_name}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-ivory-100 text-slate-600 font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600">{e.severity} / 5</td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{e.notes || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
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
            No symptoms recorded yet.
          </div>
        )}
      </div>

      {/* U03: Vernacular Voice Modal */}
      <VernacularVoiceModal
        isOpen={vernacularModalOpen}
        onClose={() => setVernacularModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* U06: RVI Grooming Modal */}
      <RviGroomingModal
        isOpen={rviModalOpen}
        onClose={() => setRviModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  )
}
