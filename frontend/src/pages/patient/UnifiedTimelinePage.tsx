import React, { useEffect, useState } from 'react'
import { Clock, Calendar, Activity, Scale, FileSpreadsheet, Stethoscope, Filter } from 'lucide-react'
import { api } from '../../services/api'
import { TimelineItem } from '../../types'

export const UnifiedTimelinePage: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTimeline() {
      try {
        const data = await api.getTimeline()
        setTimeline(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadTimeline()
  }, [])

  const filteredItems = timeline.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'period':
        return <Calendar className="w-4 h-4 text-rose-500" />
      case 'symptom':
        return <Activity className="w-4 h-4 text-plum-600" />
      case 'measurement':
        return <Scale className="w-4 h-4 text-sage-600" />
      case 'lab_result':
        return <FileSpreadsheet className="w-4 h-4 text-plum-800" />
      case 'clinician_note':
        return <Stethoscope className="w-4 h-4 text-sage-700" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'period':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'symptom':
        return 'bg-plum-50 text-plum-700 border-plum-200'
      case 'measurement':
        return 'bg-sage-50 text-sage-700 border-sage-200'
      case 'lab_result':
        return 'bg-ivory-100 text-slate-700 border-ivory-300'
      case 'clinician_note':
        return 'bg-sage-100 text-sage-800 border-sage-300'
      default:
        return 'bg-ivory-50 text-slate-600 border-ivory-200'
    }
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-subtle space-y-1">
        <h1 className="font-serif text-2xl font-bold text-plum-900">
          Unified Longitudinal Health Timeline
        </h1>
        <p className="text-xs text-slate-500">
          A single chronological stream unifying cycles, physical symptoms, metabolic measurements, and clinical records.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { key: 'all', label: 'All Records' },
          { key: 'period', label: 'Periods' },
          { key: 'symptom', label: 'Symptoms' },
          { key: 'measurement', label: 'Measurements' },
          { key: 'lab_result', label: 'Lab Tests' },
          { key: 'clinician_note', label: 'Clinician Notes' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              filter === btn.key
                ? 'bg-plum-800 text-white border-plum-800 shadow-subtle'
                : 'bg-white text-slate-600 border-ivory-300 hover:bg-ivory-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading chronological timeline...
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-ivory-300">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-plum-800 flex items-center justify-center shadow-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-plum-800" />
              </div>

              {/* Card */}
              <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-2 hover:border-plum-200 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getBadgeColor(item.type)}`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 font-medium">{item.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <h3 className="font-serif font-bold text-sm text-plum-900">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>

                {item.metadata?.notes && (
                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-ivory-200">
                    "{item.metadata.notes}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-ivory-300 text-center text-xs text-slate-400">
          No timeline events match the selected category filter.
        </div>
      )}
    </div>
  )
}
