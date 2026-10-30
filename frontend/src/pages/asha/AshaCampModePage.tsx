import React, { useState, useEffect } from 'react'
import { Users, Wifi, WifiOff, Plus, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Send, X } from 'lucide-react'
import { api } from '../../services/api'
import { AshaCampIntake } from '../../types'

export const AshaCampModePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [records, setRecords] = useState<AshaCampIntake[]>([])
  const [offlineQueue, setOfflineQueue] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Form state
  const [location, setLocation] = useState('Rampur Gram Panchayat Sub-Centre')
  const [campDate, setCampDate] = useState(new Date().toISOString().split('T')[0])
  const [age, setAge] = useState<number | ''>(21)
  const [menarcheAge, setMenarcheAge] = useState<number | ''>(13)
  const [regularity, setRegularity] = useState('irregular')
  const [symptoms, setSymptoms] = useState<string[]>(['irregular_cycles'])
  const [waist, setWaist] = useState<number | ''>(82)
  const [height, setHeight] = useState<number | ''>(156)
  const [weight, setWeight] = useState<number | ''>(60)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load offline queue
    const queued = localStorage.getItem('cycleaware_offline_camp_queue')
    if (queued) {
      try {
        setOfflineQueue(JSON.parse(queued))
      } catch (e) {
        console.error(e)
      }
    }

    loadRecords()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadRecords = async () => {
    try {
      const data = await api.listAshaCampRecords()
      setRecords(data)
    } catch (err) {
      console.warn('Could not fetch camp records:', err)
    }
  }

  const toggleSymptom = (code: string) => {
    setSymptoms(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      camp_location: location,
      camp_date: campDate,
      age: Number(age),
      menarche_age: Number(menarcheAge) || undefined,
      cycle_regularity: regularity,
      symptoms_reported: symptoms,
      waist_cm: Number(waist) || undefined,
      height_cm: Number(height) || undefined,
      weight_kg: Number(weight) || undefined
    }

    if (!isOnline) {
      // Save to offline queue
      const updatedQueue = [...offlineQueue, { ...payload, offline_id: Date.now() }]
      setOfflineQueue(updatedQueue)
      localStorage.setItem('cycleaware_offline_camp_queue', JSON.stringify(updatedQueue))
      alert('Network offline: Screening record saved securely to local queue.')
      setShowModal(false)
      return
    }

    try {
      await api.createAshaCampIntake(payload)
      alert('Camp screening record submitted successfully!')
      setShowModal(false)
      loadRecords()
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`)
    }
  }

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return
    setIsSyncing(true)
    try {
      for (const item of offlineQueue) {
        await api.createAshaCampIntake(item)
      }
      setOfflineQueue([])
      localStorage.removeItem('cycleaware_offline_camp_queue')
      alert('All offline records synchronized with primary server!')
      loadRecords()
    } catch (err: any) {
      alert(`Sync error: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-plum-900 to-plum-950 text-white rounded-2xl p-6 shadow-md border border-plum-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-plum-950">
              Community Health Worker Portal
            </span>
            <div className="flex items-center gap-1.5 text-xs text-lavender-200">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Wifi className="w-3.5 h-3.5" /> Online Mode
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <WifiOff className="w-3.5 h-3.5" /> Air-Gapped Offline Mode
                </span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold">ASHA Worker Camp Mode</h1>
          <p className="text-xs text-lavender-200 mt-1 max-w-xl">
            Offline-first rural field camp screening portal. Enforces strict patient data isolation—no worker can view longitudinal history of other individuals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOfflineQueue}
              disabled={isSyncing || !isOnline}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-plum-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Queue ({offlineQueue.length})
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Patient Screening
          </button>
        </div>
      </div>

      {/* Camp Records Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-base font-bold text-plum-900 mb-1">
          Logged Camp Screening Records
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tokenized records created during community outreach sessions. Identifying patient data is anonymized.
        </p>

        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No screening intakes recorded in this session yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Patient Token</th>
                  <th className="py-2.5 px-3 font-semibold">Camp Location</th>
                  <th className="py-2.5 px-3 font-semibold">Age</th>
                  <th className="py-2.5 px-3 font-semibold">Cycle Status</th>
                  <th className="py-2.5 px-3 font-semibold">South Asian Risk Flag</th>
                  <th className="py-2.5 px-3 font-semibold">Triage Recommendation</th>
                  <th className="py-2.5 px-3 font-semibold">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-plum-900">
                      {r.anonymous_patient_token}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{r.camp_location}</td>
                    <td className="py-2.5 px-3 text-slate-700">{r.age} yrs</td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">{r.cycle_regularity}</td>
                    <td className="py-2.5 px-3">
                      {r.asian_indian_risk_flag ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px]">
                          Risk Flag
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.triage_recommendation}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {r.sync_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screening Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-plum-900 mb-1">
              Field Camp Patient Intake
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Rapid anonymous screening questionnaire with South Asian metabolic indicators
            </p>

            <form onSubmit={handleSubmitIntake} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Camp Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Camp Date</label>
                  <input
                    type="date"
                    value={campDate}
                    onChange={(e) => setCampDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min={10}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Menarche Age</label>
                  <input
                    type="number"
                    min={8}
                    max={20}
                    value={menarcheAge}
                    onChange={(e) => setMenarcheAge(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cycle Pattern</label>
                  <select
                    value={regularity}
                    onChange={(e) => setRegularity(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="regular">Regular (21-35d)</option>
                    <option value="irregular">Irregular (&gt;35d)</option>
                    <option value="absent">Absent (&gt;90d)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Reported Physical Indicators
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { code: 'facial_acne', label: 'Persistent Acne' },
                    { code: 'excess_facial_hair', label: 'Facial / Chin Hair' },
                    { code: 'hair_thinning', label: 'Scalp Hair Thinning' },
                    { code: 'weight_gain', label: 'Unexplained Weight Gain' },
                    { code: 'dark_skin_patches', label: 'Dark Neck Folds (Acanthosis)' },
                    { code: 'cramps', label: 'Severe Menstrual Pain' }
                  ].map(s => (
                    <label key={s.code} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-white">
                      <input
                        type="checkbox"
                        checked={symptoms.includes(s.code)}
                        onChange={() => toggleSymptom(s.code)}
                        className="rounded text-plum-600 focus:ring-plum-500"
                      />
                      <span className="font-medium text-slate-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Save & Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
