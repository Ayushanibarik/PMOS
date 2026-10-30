import React, { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, ChevronRight, X, Clock, Sparkles } from 'lucide-react'
import { api } from '../../services/api'
import { PhaseCheckpoint } from '../../types'

interface Props {
  onQuickLogSuccess?: () => void
}

export const PhaseCheckinWidget: React.FC<Props> = ({ onQuickLogSuccess }) => {
  const [checkpoint, setCheckpoint] = useState<PhaseCheckpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [loggingCode, setLoggingCode] = useState<string | null>(null)

  const loadCheckpoint = async () => {
    try {
      const data = await api.getCurrentCheckpoint()
      setCheckpoint(data)
    } catch (err) {
      console.warn('Could not load phase checkpoint:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCheckpoint()
  }, [])

  if (loading || !checkpoint || !checkpoint.checkpoint_active || isDismissed) {
    return null
  }

  const handleQuickLog = async (code: string) => {
    setLoggingCode(code)
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.createSymptom({
        symptom_code: code,
        symptom_name: code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        category: checkpoint.checkpoint_type === 'luteal_phase' ? 'wellbeing' : 'menstrual',
        severity: 3,
        date: today,
        phase_checkpoint: checkpoint.checkpoint_type,
        notes: `Quick-logged from ${checkpoint.checkpoint_title}`
      })
      alert('Symptom logged to your journal!')
      if (onQuickLogSuccess) onQuickLogSuccess()
      setIsDismissed(true)
    } catch (err: any) {
      alert(`Could not log: ${err.message}`)
    } finally {
      setLoggingCode(null)
    }
  }

  return (
    <div className="bg-gradient-to-r from-plum-900 via-plum-800 to-plum-950 text-white rounded-2xl p-5 shadow-lg mb-6 relative overflow-hidden animate-fade-in border border-plum-700/50">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 p-1.5 text-plum-300 hover:text-white rounded-lg hover:bg-white/10 transition"
        title="Skip Check-in"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Day {checkpoint.current_cycle_day || '—'} Active Checkpoint
        </span>
        <span className="text-xs text-plum-300 font-medium">3-Checkpoint Micro-Logging</span>
      </div>

      <h3 className="text-base font-bold text-white mb-1">
        {checkpoint.checkpoint_title}
      </h3>
      <p className="text-xs text-lavender-100 mb-4 max-w-xl">
        {checkpoint.checkpoint_prompt}
      </p>

      {/* Suggested Quick Log Tags */}
      {checkpoint.suggested_symptom_codes.length > 0 && (
        <div className="mb-3">
          <span className="text-[11px] text-plum-300 block mb-1.5">One-tap quick observation:</span>
          <div className="flex flex-wrap gap-2">
            {checkpoint.suggested_symptom_codes.map((code) => (
              <button
                key={code}
                onClick={() => handleQuickLog(code)}
                disabled={loggingCode !== null}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-xl border border-white/15 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-rose-300" />
                {code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-plum-300">
        <span>{checkpoint.disclaimer}</span>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white hover:underline shrink-0 pl-2 font-medium"
        >
          Skip today
        </button>
      </div>
    </div>
  )
}
