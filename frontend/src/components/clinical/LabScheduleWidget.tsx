import React, { useEffect, useState } from 'react'
import { Calendar, Clock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'
import { LaboratoryScheduleReminder } from '../../types'

export const LabScheduleWidget: React.FC = () => {
  const [schedule, setSchedule] = useState<LaboratoryScheduleReminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getRecommendedLabSchedule()
        setSchedule(data)
      } catch (err) {
        console.warn('Could not load lab schedule:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || schedule.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2.5 bg-lavender-100 rounded-xl text-plum-800">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-plum-900">
            Phase-Locked Laboratory & Ultrasound Investigation Roadmap
          </h3>
          <p className="text-xs text-slate-500">
            Evidence-based investigation timing windows aligned with your menstrual cycle phase
          </p>
        </div>
      </div>

      <div className="space-y-3.5 mb-4">
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-plum-900">
                {item.test_name}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-lavender-100 text-plum-800 shrink-0">
                {item.recommended_timing}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-2">
              <b>Clinical Rationale:</b> {item.clinical_rationale}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span><b>Target Window:</b> {item.due_date_start} to {item.due_date_end}</span>
              <span><b>Preparation:</b> {item.preparation_instructions}</span>
            </div>

            {item.imaging_guidance && (
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{item.imaging_guidance}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500">
        <b>Medical Governance Notice:</b> The platform provides contextual timing guidance for clinical investigations.
        The system does NOT independently order tests or override the instructions of your treating physician.
      </div>
    </div>
  )
}
