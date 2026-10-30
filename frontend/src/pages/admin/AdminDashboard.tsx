import React, { useEffect, useState } from 'react'
import { ShieldCheck, Activity, Users, FileText, Cpu, AlertTriangle, Play, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'

export const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [auditEvents, setAuditEvents] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Experimental inference playground state
  const [infAge, setInfAge] = useState(26)
  const [infCycleLen, setInfCycleLen] = useState(42)
  const [infCycleStd, setInfCycleStd] = useState(8.5)
  const [infHirsutism, setInfHirsutism] = useState(3)
  const [infAcne, setInfAcne] = useState(3)
  const [infBmi, setInfBmi] = useState(27.5)
  const [infWaist, setInfWaist] = useState(86)
  const [inferenceResult, setInferenceResult] = useState<any | null>(null)
  const [isInferring, setIsInferring] = useState(false)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [hData, uData, aData, mData] = await Promise.all([
          api.getSystemHealth(),
          api.getAdminUsers(),
          api.getAdminAuditEvents(),
          api.getModelRegistry()
        ])
        setHealth(hData)
        setUsers(uData)
        setAuditEvents(aData)
        setModels(mData.models || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [])

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInferring(true)
    try {
      const res = await api.runExperimentalInference({
        age: infAge,
        years_post_menarche: infAge - 13,
        mean_cycle_length: infCycleLen,
        cycle_length_std: infCycleStd,
        skipped_cycles_per_year: 3,
        hirsutism_score: infHirsutism,
        acne_severity: infAcne,
        hair_thinning_severity: 2,
        bmi: infBmi,
        waist_cm: infWaist,
        fasting_glucose: 98.0
      })
      setInferenceResult(res)
    } catch (err: any) {
      alert(`Inference failed: ${err.message}`)
    } finally {
      setIsInferring(false)
    }
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-plum-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-plum-800" />
            <span>Platform Administration & Model Registry</span>
          </h1>
          <p className="text-xs text-slate-500">
            System health, compliance audit logs, and AI model governance registry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-sage-50 text-sage-800 border border-sage-200">
          <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
          <span>System Status: Healthy</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Users
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {health?.statistics?.total_registered_users || 0}
          </div>
          <div className="text-[10px] text-slate-400">Registered platform accounts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menstrual Records
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {health?.statistics?.total_menstrual_records || 0}
          </div>
          <div className="text-[10px] text-slate-400">Logged periods in database</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Primary Terminology
          </div>
          <div className="text-2xl font-bold text-plum-900">
            {health?.primary_terminology || 'PMOS'}
          </div>
          <div className="text-[10px] text-slate-400">Configurable clinical standard</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical ML Status
          </div>
          <div className="text-sm font-bold text-rose-600 uppercase">
            Disabled (Safety Policy)
          </div>
          <div className="text-[10px] text-slate-400">Strict non-diagnostic guardrail</div>
        </div>
      </div>

      {/* Model Registry & AI Governance Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-ivory-200">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-plum-800" />
            <h2 className="font-serif font-bold text-xl text-plum-900">
              Model Registry & AI Model Cards
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
            Experimental Research Only
          </span>
        </div>

        {models.map((m) => (
          <div key={m.model_id} className="p-6 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-bold text-sm text-plum-900">{m.model_name}</span>
                <span className="text-slate-400 text-[11px] ml-2">ID: {m.model_id} • Version: {m.version}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ivory-200 text-slate-600">
                Algorithm: {m.algorithm}
              </span>
            </div>

            {/* Validation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-[10px] text-slate-400 block">ROC-AUC (5-Fold)</span>
                <strong className="text-sm text-plum-900">{m.metrics?.roc_auc_mean}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-[10px] text-slate-400 block">Sensitivity (Recall)</span>
                <strong className="text-sm text-plum-900">{m.metrics?.sensitivity_recall_mean}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-[10px] text-slate-400 block">Specificity</span>
                <strong className="text-sm text-plum-900">{m.metrics?.specificity_mean}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-[10px] text-slate-400 block">Brier Score Loss</span>
                <strong className="text-sm text-plum-900">{m.metrics?.brier_score_loss_mean}</strong>
              </div>
            </div>

            {/* Feature Importances Breakdown */}
            <div className="space-y-1.5">
              <span className="font-semibold text-plum-900 block">Top Feature Importances (Gini Attribution):</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(m.feature_importances || {}).slice(0, 6).map(([feat, imp]: any) => (
                  <span key={feat} className="px-2 py-1 bg-white border border-ivory-200 rounded-lg text-[11px] text-slate-700">
                    <strong>{feat}</strong>: {imp}
                  </span>
                ))}
              </div>
            </div>

            {/* Guardrail Disclaimer */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
              <strong>Clinical Guardrail Directive:</strong>
              <p>{m.known_limitations?.join(' ')}</p>
            </div>
          </div>
        ))}

        {/* Experimental Inference Playground */}
        <div className="pt-4 border-t border-ivory-200 space-y-4">
          <h3 className="font-serif font-bold text-lg text-plum-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-plum-800" />
            <span>Interactive Research Inference & Explainability Testbed</span>
          </h3>

          <form onSubmit={handleRunInference} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Age</label>
              <input type="number" value={infAge} onChange={e => setInfAge(Number(e.target.value))} className="w-full px-2 py-1.5 border border-ivory-300 rounded" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Mean Cycle Length (d)</label>
              <input type="number" value={infCycleLen} onChange={e => setInfCycleLen(Number(e.target.value))} className="w-full px-2 py-1.5 border border-ivory-300 rounded" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Cycle Std Dev (d)</label>
              <input type="number" step="0.1" value={infCycleStd} onChange={e => setInfCycleStd(Number(e.target.value))} className="w-full px-2 py-1.5 border border-ivory-300 rounded" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Hirsutism Score (0-5)</label>
              <input type="number" value={infHirsutism} onChange={e => setInfHirsutism(Number(e.target.value))} className="w-full px-2 py-1.5 border border-ivory-300 rounded" />
            </div>

            <div className="col-span-2 sm:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={isInferring}
                className="px-4 py-2 bg-plum-800 text-white rounded-xl font-semibold text-xs shadow-subtle hover:bg-plum-700 disabled:opacity-50"
              >
                {isInferring ? 'Evaluating Feature Attribution...' : 'Run Experimental Model Inference'}
              </button>
            </div>
          </form>

          {inferenceResult && (
            <div className="p-4 bg-white border border-plum-200 rounded-2xl shadow-subtle text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-plum-900">Experimental Score: {inferenceResult.experimental_score}</span>
                <span className="text-[10px] text-slate-400">{inferenceResult.score_interpretation}</span>
              </div>
              <div className="p-2 bg-rose-50 text-rose-800 text-[10px] rounded border border-rose-200">
                {inferenceResult.disclaimer_banner}
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-600 block">Attribution Vectors:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                  {inferenceResult.feature_attributions?.slice(0, 6).map((a: any) => (
                    <div key={a.feature} className="p-1.5 bg-ivory-50 rounded border border-ivory-200">
                      <strong>{a.feature}</strong>: {a.effect_direction} ({a.relative_importance_weight})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Audit Events Log */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Security & Privacy Audit Log Events
        </h2>

        {auditEvents.length > 0 ? (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Actor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {auditEvents.slice(0, 10).map((ev) => (
                  <tr key={ev.id} className="hover:bg-ivory-50/50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{ev.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-plum-900">{ev.event_type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{ev.resource_type || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{ev.actor_id?.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit events recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}

