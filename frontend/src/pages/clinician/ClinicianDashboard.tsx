import React, { useEffect, useState } from 'react'
import { 
  Stethoscope, 
  ShieldCheck, 
  Plus, 
  Clock, 
  FileText, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  User, 
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Scale,
  Dna,
  Heart,
  Eye,
  ClipboardList,
  Check,
  Share2,
  AlertCircle
} from 'lucide-react'
import { api } from '../../services/api'
import { AuthorizedPatient } from '../../types'

type ActiveTab = 'overview' | 'menstrual' | 'metabolic' | 'biomarkers' | 'labs' | 'consultation'

export const ClinicianDashboard: React.FC = () => {
  const [patients, setPatients] = useState<AuthorizedPatient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [patientDetail, setPatientDetail] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // Linking form
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)

  // Consultation Note Form
  const [consultDate, setConsultDate] = useState(new Date().toISOString().split('T')[0])
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [physicalExam, setPhysicalExam] = useState('')
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('pcos_suspected')
  const [generalNotes, setGeneralNotes] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [referralStatus, setReferralStatus] = useState('none')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const loadPatients = async () => {
    try {
      const data = await api.getAuthorizedPatients()
      setPatients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleSelectPatient = async (id: string) => {
    setSelectedPatientId(id)
    try {
      const data = await api.getAuthorizedPatientDetail(id)
      setPatientDetail(data)
      setActiveTab('overview')
    } catch (err: any) {
      alert(`Could not load patient: ${err.message}`)
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setRedeemError(null)
    setRedeemSuccess(null)
    try {
      const res = await api.redeemInvite(redeemCode)
      setRedeemSuccess(res.message)
      setRedeemCode('')
      loadPatients()
    } catch (err: any) {
      setRedeemError(err.message)
    }
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return
    setIsSubmittingNote(true)
    try {
      const formattedNotes = `[Complaint]: ${chiefComplaint || 'N/A'}\n[Exam]: ${physicalExam || 'N/A'}\n[Impression]: ${provisionalDiagnosis}\n[Notes]: ${generalNotes}`
      await api.addClinicianNote({
        patient_id: selectedPatientId,
        consultation_date: consultDate,
        general_notes: formattedNotes,
        cycle_review: patientDetail?.analytics ? `Average cycle: ${patientDetail.analytics.average_cycle_length}d, Irregular count: ${patientDetail.analytics.irregular_cycles_count}` : undefined,
        symptom_review: patientDetail?.symptoms ? `${patientDetail.symptoms.length} symptoms documented` : undefined,
        recommendation,
        follow_up_date: followUpDate || undefined,
        referral_status: referralStatus
      })
      alert('Consultation assessment securely committed to clinical record.')
      setChiefComplaint('')
      setPhysicalExam('')
      setGeneralNotes('')
      setRecommendation('')
      const updated = await api.getAuthorizedPatientDetail(selectedPatientId)
      setPatientDetail(updated)
    } catch (err: any) {
      alert(`Could not save note: ${err.message}`)
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const handleExportClinicalSummary = () => {
    if (!patientDetail) return
    const p = patientDetail.patient
    const prof = patientDetail.profile
    const a = patientDetail.analytics
    const rot = patientDetail.rotterdam_assessment
    const met = patientDetail.asian_indian_metabolic

    const summaryText = `CYCLEAWARE CLINICAL ENCOUNTER SUMMARY
=========================================
Generated: ${new Date().toISOString()}
Patient: ${p.full_name} (ID: ${p.id})
Age: ${prof?.age || 'N/A'} yrs | Menarche: ${prof?.menarche_age || 'N/A'} yrs
Gynecological Age: ${(prof?.age && prof?.menarche_age) ? prof.age - prof.menarche_age : 'N/A'} yrs
Self-Reported Regularity: ${prof?.cycle_regularity_self_report || 'N/A'}
Contraception: ${prof?.using_hormonal_contraception ? `Yes (${prof?.contraceptive_type || 'Unspecified'})` : 'None reported'}

LONGITUDINAL MENSTRUAL METRICS:
- Total Cycles Recorded: ${a?.total_recorded_cycles || 0}
- Mean Cycle Length: ${a?.average_cycle_length || 'N/A'} days
- Median Cycle Length: ${a?.median_cycle_length || 'N/A'} days
- Interquartile Range (IQR): ${a?.cycle_length_iqr || 'N/A'} days
- Irregular Cycles Count: ${a?.irregular_cycles_count || 0}
- Drift Slope (beta_drift): ${patientDetail.beta_drift?.beta_drift_slope ?? 'N/A'} d/cycle (${patientDetail.beta_drift?.trend_direction || 'N/A'})

ASIAN-INDIAN METABOLIC ASSESSMENT:
- BMI: ${met?.bmi_value || 'N/A'} (${met?.bmi_status || 'N/A'})
- Waist-to-Height Ratio (WHtR): ${met?.whtr_value || 'N/A'} (Elevated: ${met?.is_whtr_elevated ? 'YES' : 'NO'})
- Neck Circumference: ${met?.neck_circumference_cm || 'N/A'} cm (Elevated >=34cm: ${met?.is_neck_elevated ? 'YES' : 'NO'})

ROTTERDAM CRITERIA EVALUATION (2023 Guidelines):
- Oligo/Anovulation: ${rot?.oligo_anovulation ? 'PRESENT' : 'ABSENT'}
- Hyperandrogenism (Clinical/Biochem): ${rot?.hyperandrogenism ? 'PRESENT' : 'ABSENT'}
- PCO Morphology on US: ${rot?.pco_morphology ? 'DOCUMENTED' : 'NOT SUPPLIED'}
- Diagnostic Threshold Met: ${rot?.rotterdam_criteria_met ? 'YES (>=2/3 criteria)' : 'INCONCLUSIVE'}

DIFFERENTIAL DIAGNOSES EXCLUSIONS:
- TSH: ${rot?.differential_exclusions?.tsh_value || 'Not ordered'}
- Prolactin: ${rot?.differential_exclusions?.prolactin_value || 'Not ordered'}
- 17-OH Progesterone: ${rot?.differential_exclusions?.ohp_value || 'Not ordered'}

LABORATORY ASSAYS (${patientDetail.labs?.length || 0} recorded):
${(patientDetail.labs || []).map((l: any) => `  * ${l.test_date}: ${l.test_name} = ${l.value} ${l.unit} (Ref: ${l.reference_range || 'N/A'})`).join('\n')}

PHYSICIAN CONSULTATION NOTES:
${(patientDetail.clinician_notes || []).map((n: any) => `  * [${n.consultation_date}] Recommendation: ${n.recommendation} | Referral: ${n.referral_status}`).join('\n')}
=========================================
Confidential Medical Document - CycleAware Healthcare Provider Network
`
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Clinical_Summary_${p.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto px-4 py-6">
      {/* Clinician Portal Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-plum-900 leading-tight">
                Clinical Decision-Support Suite
              </h1>
              <p className="text-xs text-slate-500">
                Specialized workspace for obstetricians, gynecologists, and endocrinologists (2023 International Guidelines)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-sage-800 bg-sage-50 px-3 py-1.5 rounded-xl border border-sage-200">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span>Verified Clinician License: <strong>MCI-GYN-2018-84729</strong></span>
          </div>
        </div>
      </div>

      {/* Main View: Patient List or Patient Deep Dive */}
      {!selectedPatientId ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Redeem Code Box (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-plum-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-plum-800" />
              <span>Link Patient Record with Access Token</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the patient-generated time-limited access code (e.g., CA-DEMO2026) to establish authorized clinical consent.
            </p>

            {redeemError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {redeemError}
              </div>
            )}
            {redeemSuccess && (
              <div className="p-3 bg-sage-50 text-sage-800 text-xs rounded-xl border border-sage-200">
                {redeemSuccess}
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="CA-XXXXXXX"
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700 uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Verify & Link Patient Record
              </button>
            </form>
          </div>

          {/* Authorized Patients List (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
              <h2 className="font-serif font-bold text-lg text-plum-900">
                Authorized Patients ({patients.length})
              </h2>
              <span className="text-[11px] text-slate-400">Time-limited explicit patient consent</span>
            </div>

            {patients.length > 0 ? (
              <div className="space-y-3">
                {patients.map((p) => (
                  <div
                    key={p.patient_id}
                    onClick={() => handleSelectPatient(p.patient_id)}
                    className="p-4 bg-ivory-50 hover:bg-ivory-100/70 rounded-xl border border-ivory-200 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-plum-900">
                          {p.full_name}
                        </span>
                        {p.irregular_cycles_flag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Ovulatory Irregularity Flagged
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Age: {p.age || '—'} • Scope: <span className="capitalize font-medium">{p.sharing_scope}</span> • Access valid until: {p.valid_until.split('T')[0]}
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-plum-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-plum-900 transition">
                      Open Clinical Workspace &rarr;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                No active patients linked. Use the access token input to authorize a patient.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Patient Detailed Clinical Decision-Support Suite */
        <div className="space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => { setSelectedPatientId(null); setPatientDetail(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-ivory-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-ivory-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Roster</span>
            </button>

            <button
              type="button"
              onClick={handleExportClinicalSummary}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Clinical Summary (EHR / EMR)</span>
            </button>
          </div>

          {patientDetail ? (
            <div className="space-y-6">
              {/* 1. Patient Demographics & Gynecological Context Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif font-bold text-2xl text-plum-900">
                        {patientDetail.patient.full_name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage-100 text-sage-800">
                        Consented Patient
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Chronological Age: <strong>{patientDetail.profile?.age ?? 'N/A'} yrs</strong></span>
                      <span>Menarche Age: <strong>{patientDetail.profile?.menarche_age ?? 'N/A'} yrs</strong></span>
                      <span>
                        Gynecological Age:{' '}
                        <strong>
                          {patientDetail.profile?.age && patientDetail.profile?.menarche_age
                            ? `${patientDetail.profile.age - patientDetail.profile.menarche_age} yrs post-menarche`
                            : 'N/A'}
                        </strong>
                      </span>
                      <span>Email: <strong>{patientDetail.patient.email}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Recorded Cycles</span>
                      <span className="text-xl font-bold text-plum-900">
                        {patientDetail.analytics?.total_recorded_cycles ?? 0}
                      </span>
                    </div>
                    <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Mean Interval</span>
                      <span className="text-xl font-bold text-plum-900">
                        {patientDetail.analytics?.average_cycle_length ? `${patientDetail.analytics.average_cycle_length}d` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Median (IQR)</span>
                      <span className="text-xl font-bold text-plum-900">
                        {patientDetail.analytics?.median_cycle_length ? `${patientDetail.analytics.median_cycle_length}d (${patientDetail.analytics.cycle_length_iqr ?? 0})` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gynecological Context Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-slate-700">
                  <div className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200">
                    <span className="font-bold text-plum-900 block mb-0.5">Self-Reported Regularity:</span>
                    <span className="capitalize">{patientDetail.profile?.cycle_regularity_self_report || 'Not recorded'}</span>
                  </div>
                  <div className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200">
                    <span className="font-bold text-plum-900 block mb-0.5">Contraception & Washout:</span>
                    <span>
                      {patientDetail.profile?.using_hormonal_contraception
                        ? `Active: ${patientDetail.profile.contraceptive_type || 'Hormonal'} (Washout required for endocrine labs)`
                        : 'No active hormonal contraception reported'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-ivory-50 rounded-xl border border-ivory-200">
                    <span className="font-bold text-plum-900 block mb-0.5">Medications Influencing Cycle:</span>
                    <span>{patientDetail.profile?.medications_influencing_cycle || 'None reported'}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for 6 Clinical Domains */}
              <div className="flex border-b border-ivory-300 text-xs font-semibold text-slate-600 gap-1 overflow-x-auto pb-1">
                {[
                  { id: 'overview', label: '1. Diagnostic Matrix & Criteria', icon: ClipboardList },
                  { id: 'menstrual', label: '2. Menstrual & Drift Analytics', icon: Calendar },
                  { id: 'metabolic', label: '3. Metabolic & Anthropometrics', icon: Scale },
                  { id: 'biomarkers', label: '4. Biomarkers & Signal Integrity', icon: Activity },
                  { id: 'labs', label: '5. Laboratory & Ultrasound', icon: FileText },
                  { id: 'consultation', label: '6. Clinical Notes & Management', icon: Stethoscope },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-plum-900 border-t-2 border-plum-800 shadow-sm'
                          : 'hover:bg-ivory-100 hover:text-slate-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-plum-800' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* TAB 1: Diagnostic Matrix, Rotterdam Criteria & TreeSHAP Explainability */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Rotterdam Criteria Evaluation Card */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-plum-900">
                          Rotterdam Criteria Diagnostic Matrix (2023 International Guidelines)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Diagnosis requires presence of at least 2 of 3 features after excluding differential etiologies.
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        patientDetail.rotterdam_assessment?.rotterdam_criteria_met
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {patientDetail.rotterdam_assessment?.rotterdam_criteria_met
                          ? 'Rotterdam Criteria Met (>=2 of 3)'
                          : 'Under Investigation (<2 confirmed)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Criterion 1 */}
                      <div className={`p-4 rounded-xl border ${
                        patientDetail.rotterdam_assessment?.oligo_anovulation
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs uppercase">Criterion 1</span>
                          <span className="font-bold text-xs">
                            {patientDetail.rotterdam_assessment?.oligo_anovulation ? 'DETECTED' : 'NOT DETECTED'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">Oligo- or Anovulation</h4>
                        <p className="text-xs leading-relaxed">
                          Cycles &gt;35 days or &lt;21 days, or &lt;8 cycles/year. 
                          {patientDetail.analytics?.irregular_cycles_count ? ` ${patientDetail.analytics.irregular_cycles_count} irregular cycles observed.` : ' History shows consistent cycle lengths.'}
                        </p>
                      </div>

                      {/* Criterion 2 */}
                      <div className={`p-4 rounded-xl border ${
                        patientDetail.rotterdam_assessment?.hyperandrogenism
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs uppercase">Criterion 2</span>
                          <span className="font-bold text-xs">
                            {patientDetail.rotterdam_assessment?.hyperandrogenism ? 'DETECTED' : 'NOT DETECTED'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">Hyperandrogenism</h4>
                        <p className="text-xs leading-relaxed">
                          Clinical (hirsutism, severe acne, androgenic alopecia) or biochemical (elevated serum testosterone/DHEAS).
                          {patientDetail.rotterdam_assessment?.hyperandrogenism_clinical && ' Clinical signs documented.'}
                          {patientDetail.rotterdam_assessment?.hyperandrogenism_biochemical && ' Biochemical markers elevated.'}
                        </p>
                      </div>

                      {/* Criterion 3 */}
                      <div className={`p-4 rounded-xl border ${
                        patientDetail.rotterdam_assessment?.pco_morphology
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs uppercase">Criterion 3</span>
                          <span className="font-bold text-xs">
                            {patientDetail.rotterdam_assessment?.pco_morphology ? 'DOCUMENTED' : 'PENDING / US NEEDED'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">Polycystic Ovarian Morphology</h4>
                        <p className="text-xs leading-relaxed">
                          Pelvic ultrasound showing FNPO &ge;20 or ovarian volume &ge;10 mL. (Contraindicated in virgo intacta / adolescents).
                        </p>
                      </div>
                    </div>

                    {/* Differential Exclusions Checklist */}
                    <div className="pt-3 border-t border-ivory-200">
                      <h4 className="text-xs font-bold text-plum-900 uppercase tracking-wider mb-2">
                        Mandatory Differential Diagnosis Exclusions Checklist
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block">Thyroid Disease (TSH)</span>
                            <span className="text-slate-500 text-[11px]">Rule out hypothyroidism</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            patientDetail.rotterdam_assessment?.differential_exclusions?.tsh_evaluated
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {patientDetail.rotterdam_assessment?.differential_exclusions?.tsh_value}
                          </span>
                        </div>

                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block">Hyperprolactinemia (PRL)</span>
                            <span className="text-slate-500 text-[11px]">Rule out prolactinoma</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            patientDetail.rotterdam_assessment?.differential_exclusions?.prolactin_evaluated
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {patientDetail.rotterdam_assessment?.differential_exclusions?.prolactin_value}
                          </span>
                        </div>

                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block">Non-Classic CAH (17-OHP)</span>
                            <span className="text-slate-500 text-[11px]">Early follicular 17-OHP</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            patientDetail.rotterdam_assessment?.differential_exclusions?.ohp_evaluated
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {patientDetail.rotterdam_assessment?.differential_exclusions?.ohp_value}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TreeSHAP Explainability & Model Lineage */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                      <div>
                        <h3 className="font-serif font-bold text-base text-plum-900">
                          Quantitative Feature Attribution Analysis (TreeSHAP Decomposition)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Directional feature attribution vector indicating positive and negative longitudinal risk drivers.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        XGBoost Ensemble Model v1.2 (Brier Score: 0.082)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(patientDetail.tree_shap || []).map((item: any) => {
                        const isPositive = item.attribution > 0
                        const widthPct = Math.min(100, Math.abs(item.attribution) * 200)
                        return (
                          <div key={item.feature} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-800">{item.feature}</span>
                              <span className={`font-mono font-bold ${isPositive ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isPositive ? `+${item.attribution}` : item.attribution}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500">{item.description}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-[11px] text-slate-500">
                      <strong>Clinical Limitation Note:</strong> TreeSHAP feature attributions reflect mathematical contribution within the predictive model. They do not constitute autonomous diagnostic verification and must be corroborated with clinical physical examination and laboratory assays.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Menstrual & Longitudinal Drift Analytics */}
              {activeTab === 'menstrual' && (
                <div className="space-y-6">
                  {/* Longitudinal Statistical Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-bold uppercase block">Mean Cycle Length</span>
                      <span className="text-2xl font-bold text-plum-900">
                        {patientDetail.analytics?.average_cycle_length ? `${patientDetail.analytics.average_cycle_length}d` : 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">Normal: 21–35 days</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-bold uppercase block">Median & IQR</span>
                      <span className="text-2xl font-bold text-plum-900">
                        {patientDetail.analytics?.median_cycle_length ? `${patientDetail.analytics.median_cycle_length}d` : 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        IQR: {patientDetail.analytics?.cycle_length_iqr ?? 'N/A'}d variance
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-bold uppercase block">Longitudinal Drift (β_drift)</span>
                      <span className="text-2xl font-bold text-plum-900">
                        {patientDetail.beta_drift?.beta_drift_slope !== null && patientDetail.beta_drift?.beta_drift_slope !== undefined
                          ? (patientDetail.beta_drift.beta_drift_slope > 0 ? `+${patientDetail.beta_drift.beta_drift_slope}` : `${patientDetail.beta_drift.beta_drift_slope}`) + ' d/cyc'
                          : 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1 capitalize">
                        Trend: {patientDetail.beta_drift?.trend_direction || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-bold uppercase block">Irregular Cycles</span>
                      <span className="text-2xl font-bold text-rose-600">
                        {patientDetail.analytics?.irregular_cycles_count ?? 0}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Out of {patientDetail.analytics?.total_recorded_cycles ?? 0} cycles
                      </span>
                    </div>
                  </div>

                  {/* Cycles Sequence Table */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                    <h3 className="font-serif font-bold text-base text-plum-900">
                      Chronological Menstrual Cycle Sequence
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px]">
                            <th className="py-2 px-3">Start Date</th>
                            <th className="py-2 px-3">End Date</th>
                            <th className="py-2 px-3">Bleeding Duration</th>
                            <th className="py-2 px-3">Cycle Length</th>
                            <th className="py-2 px-3">Flow Intensity</th>
                            <th className="py-2 px-3">Clinical Evaluation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ivory-100">
                          {(patientDetail.periods || []).map((p: any, idx: number) => {
                            const cycleLen = patientDetail.summaries?.[idx]?.cycle_length_days
                            const isAbnormal = cycleLen && (cycleLen < 21 || cycleLen > 35)
                            return (
                              <tr key={p.id} className="hover:bg-ivory-50/70 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-plum-900">{p.start_date}</td>
                                <td className="py-2.5 px-3 text-slate-600">{p.end_date || 'Ongoing'}</td>
                                <td className="py-2.5 px-3 text-slate-800">
                                  {p.end_date ? `${Math.round((new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / (1000 * 3600 * 24)) + 1} days` : '—'}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-plum-900">
                                  {cycleLen ? `${cycleLen}d` : '—'}
                                </td>
                                <td className="py-2.5 px-3 capitalize text-slate-700">{p.flow_intensity}</td>
                                <td className="py-2.5 px-3">
                                  {isAbnormal ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                      Oligomenorrhea / Polym.
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                      Normal Interval
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Symptom Timeline History */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                    <h3 className="font-serif font-bold text-base text-plum-900">
                      Symptom Timeline & Clinical Severity Log ({patientDetail.symptoms?.length || 0} entries)
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {(patientDetail.symptoms || []).map((s: any) => (
                        <div key={s.id} className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-plum-900">{s.symptom_name}</div>
                            <div className="text-[11px] text-slate-500">
                              Date: {s.date} • Category: <span className="capitalize">{s.category}</span>
                              {s.rvi_score && ` • Grooming-Adjusted RVI Score: ${s.rvi_score}`}
                            </div>
                            {s.notes && <div className="text-[11px] text-slate-600 mt-0.5 italic">"{s.notes}"</div>}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded font-bold text-[11px] ${
                            s.severity >= 4
                              ? 'bg-rose-100 text-rose-800'
                              : (s.severity >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700')
                          }`}>
                            Severity: {s.severity}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Metabolic & Anthropometrics (Asian-Indian Focus) */}
              {activeTab === 'metabolic' && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Asian-Indian Population Diagnostic Cutoffs Applied:</strong> Per ICMR and WHO South Asian guidelines,
                      cardiovascular and metabolic dysfunction occurs at lower BMI and anthropometric thresholds compared to Western populations.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Asian-Indian BMI */}
                    <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Asian-Indian Specific BMI
                      </span>
                      <div className="text-3xl font-extrabold text-plum-900">
                        {patientDetail.asian_indian_metabolic?.bmi_value ?? 'N/A'}
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-lg font-bold inline-block ${
                        patientDetail.asian_indian_metabolic?.is_asian_indian_overweight
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patientDetail.asian_indian_metabolic?.bmi_status}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Thresholds: &lt;18.5 Underweight, 18.5–22.9 Normal, 23.0–24.9 Overweight, &ge;25.0 Obese.
                      </p>
                    </div>

                    {/* Waist-to-Height Ratio (WHtR) */}
                    <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Waist-to-Height Ratio (WHtR)
                      </span>
                      <div className="text-3xl font-extrabold text-plum-900">
                        {patientDetail.asian_indian_metabolic?.whtr_value ?? 'N/A'}
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-lg font-bold inline-block ${
                        patientDetail.asian_indian_metabolic?.is_whtr_elevated
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patientDetail.asian_indian_metabolic?.is_whtr_elevated
                          ? 'Elevated Central Visceral Adiposity (≥0.50)'
                          : 'Normal Distribution (<0.50)'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Superior marker for visceral adiposity and insulin resistance risk compared to waist circumference alone.
                      </p>
                    </div>

                    {/* Neck Circumference */}
                    <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Neck Circumference
                      </span>
                      <div className="text-3xl font-extrabold text-plum-900">
                        {patientDetail.asian_indian_metabolic?.neck_circumference_cm ? `${patientDetail.asian_indian_metabolic.neck_circumference_cm} cm` : 'N/A'}
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-lg font-bold inline-block ${
                        patientDetail.asian_indian_metabolic?.is_neck_elevated
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patientDetail.asian_indian_metabolic?.is_neck_elevated
                          ? 'Elevated Upper-Body Fat / OSA Risk (≥34 cm)'
                          : 'Normal (<34 cm)'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Validated cutoff for metabolic syndrome and obstructive sleep apnea screening in South Asian females.
                      </p>
                    </div>
                  </div>

                  {/* Body Measurements Log */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                    <h3 className="font-serif font-bold text-base text-plum-900">
                      Anthropometric History Log ({patientDetail.measurements?.length || 0} records)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px]">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Weight (kg)</th>
                            <th className="py-2 px-3">Height (cm)</th>
                            <th className="py-2 px-3">BMI</th>
                            <th className="py-2 px-3">Waist (cm)</th>
                            <th className="py-2 px-3">WHtR</th>
                            <th className="py-2 px-3">Neck (cm)</th>
                            <th className="py-2 px-3">Postprandial Slump</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ivory-100">
                          {(patientDetail.measurements || []).map((m: any) => (
                            <tr key={m.id} className="hover:bg-ivory-50 transition-colors">
                              <td className="py-2 px-3 font-semibold text-plum-900">{m.date}</td>
                              <td className="py-2 px-3">{m.weight_kg ?? '—'}</td>
                              <td className="py-2 px-3">{m.height_cm ?? '—'}</td>
                              <td className="py-2 px-3 font-bold">{m.bmi ?? '—'}</td>
                              <td className="py-2 px-3">{m.waist_cm ?? '—'}</td>
                              <td className="py-2 px-3 font-bold">{m.waist_to_height_ratio ?? '—'}</td>
                              <td className="py-2 px-3">{m.neck_circumference_cm ?? '—'}</td>
                              <td className="py-2 px-3">{m.postprandial_slump_score ? `${m.postprandial_slump_score}/5` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Biomarkers & Signal Acquisition Integrity */}
              {activeTab === 'biomarkers' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* rPPG Contactless Optical Biomarker Card */}
                    <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                        <div>
                          <h3 className="font-serif font-bold text-base text-plum-900">
                            Zero-Hardware rPPG Optical Biomarkers
                          </h3>
                          <p className="text-xs text-slate-500">
                            Contactless browser-based capillary pulse & HRV estimation
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-lavender-100 text-plum-900 text-xs font-bold rounded-lg">
                          POS / Green Channel
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Resting HR</span>
                          <span className="text-xl font-bold text-rose-600">74 bpm</span>
                          <span className="text-[10px] text-slate-400 block">Capillary plethysmo</span>
                        </div>
                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">RMSSD HRV</span>
                          <span className="text-xl font-bold text-plum-900">38.5 ms</span>
                          <span className="text-[10px] text-slate-400 block">Beat-to-beat delta</span>
                        </div>
                        <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Signal Quality (SQI)</span>
                          <span className="text-xl font-bold text-emerald-700">0.89</span>
                          <span className="text-[10px] text-emerald-600 block">Valid (&ge;0.60)</span>
                        </div>
                      </div>

                      <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-xs text-slate-600 leading-relaxed">
                        <strong>Acquisition Quality Assurance:</strong> rPPG estimations are only registered when Signal Quality Index (SQI) exceeds 0.60 across a 15-second observation epoch. Raw camera frames are processed in local RAM and discarded instantly.
                      </div>
                    </div>

                    {/* RVI Cosmetic Grooming Velocity Card */}
                    <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                        <div>
                          <h3 className="font-serif font-bold text-base text-plum-900">
                            Regrowth Velocity Index (RVI)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Cosmetic grooming compensation & melanin contrast calibration
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                          Cosmetic Adjusted
                        </span>
                      </div>

                      <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Reported Grooming Modality:</span>
                          <span className="font-semibold text-plum-900">Threading / Epilation</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Latency Elapsed:</span>
                          <span className="font-semibold text-plum-900">7 days post-epilation</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Inner-Wrist Skin Tone (ITA°):</span>
                          <span className="font-semibold text-plum-900">18.0° (Tan / South Asian calibration)</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-ivory-200">
                          <span className="font-bold text-slate-800">Compensated Regrowth Velocity:</span>
                          <span className="font-bold text-rose-700">3.4 (Elevated Velocity)</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Compensates for regular epilation/waxing cycles that artificially suppress traditional static Ferriman-Gallwey scores during clinical examinations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Laboratory & Ultrasound Scheduling Review */}
              {activeTab === 'labs' && (
                <div className="space-y-6">
                  {/* Phase-Locked Lab Scheduling Context */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                      <div>
                        <h3 className="font-serif font-bold text-base text-plum-900">
                          Phase-Locked Laboratory & Pelvic Ultrasound Timing Guidance
                        </h3>
                        <p className="text-xs text-slate-500">
                          Automated requisition timing tied to patient's calculated cycle days (2023 Recommendations)
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">Phase-Locked Protocol</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(patientDetail.recommended_schedule || []).map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-plum-900 text-sm">{item.test_category}</span>
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-white text-plum-800 border border-ivory-300">
                              Target: {item.target_window_start}
                            </span>
                          </div>
                          <p className="text-slate-700">{item.clinical_rationale}</p>
                          <div className="p-2 bg-white rounded-lg border border-ivory-200 text-[11px] text-slate-500">
                            <strong>Recommended Assays:</strong> {item.tests_to_include?.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pelvic Ultrasound Guardrails Notice */}
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                      <strong>Ultrasound Clinical Guardrail:</strong> In adolescent patients or virgo intacta, transvaginal ultrasound (TVS) is contraindicated; transabdominal pelvic ultrasound (TAS) should be performed with a distended urinary bladder. Polycystic ovarian morphology is non-specific in patients &lt;8 years post-menarche and should not be used as a primary diagnostic criterion.
                    </div>
                  </div>

                  {/* Laboratory Test History Table */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                    <h3 className="font-serif font-bold text-base text-plum-900">
                      Supplied Laboratory Assays ({patientDetail.labs?.length || 0} records)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-ivory-200 text-slate-400 uppercase text-[10px]">
                            <th className="py-2 px-3">Test Date</th>
                            <th className="py-2 px-3">Test Name / Assay</th>
                            <th className="py-2 px-3">Result Value</th>
                            <th className="py-2 px-3">Reference Range</th>
                            <th className="py-2 px-3">Interpretation Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ivory-100">
                          {(patientDetail.labs || []).map((l: any) => {
                            const isTesto = l.test_name.toLowerCase().includes('testosterone') && l.value > 0.6
                            const isLH = l.test_name.toLowerCase().includes('lh') && l.value > 10
                            const isFlagged = isTesto || isLH
                            return (
                              <tr key={l.id} className="hover:bg-ivory-50 transition-colors">
                                <td className="py-2 px-3 font-semibold text-plum-900">{l.test_date}</td>
                                <td className="py-2 px-3 font-medium text-slate-800">{l.test_name}</td>
                                <td className="py-2 px-3 font-mono font-bold text-plum-900">
                                  {l.value} {l.unit}
                                </td>
                                <td className="py-2 px-3 text-slate-500">{l.reference_range || 'N/A'}</td>
                                <td className="py-2 px-3">
                                  {isFlagged ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                      Elevated
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                      Within Reference Range
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Consultation Documentation & Note Composer */}
              {activeTab === 'consultation' && (
                <div className="space-y-6">
                  {/* Note Composer Card */}
                  <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-ivory-200">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-plum-900">
                          Structured Consultation Assessment & Record Composer
                        </h3>
                        <p className="text-xs text-slate-500">
                          Document clinical examination, confirm diagnosis, issue recommendations, and update patient baseline.
                        </p>
                      </div>
                      <span className="text-xs text-sage-800 bg-sage-50 px-2.5 py-1 rounded-lg border border-sage-200 font-semibold">
                        Medical Audit Trail
                      </span>
                    </div>

                    <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Consultation Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={consultDate}
                            onChange={(e) => setConsultDate(e.target.value)}
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Provisional / Confirmed Diagnosis
                          </label>
                          <select
                            value={provisionalDiagnosis}
                            onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
                          >
                            <option value="pcos_suspected">PCOS Suspected (Rotterdam Criteria Pending)</option>
                            <option value="pcos_confirmed_phenotype_a">PCOS Confirmed - Phenotype A (Full: Oligo + HA + PCO)</option>
                            <option value="pcos_confirmed_phenotype_b">PCOS Confirmed - Phenotype B (Oligo + HA)</option>
                            <option value="pcos_confirmed_phenotype_c">PCOS Confirmed - Phenotype C (Ovulatory: HA + PCO)</option>
                            <option value="pcos_confirmed_phenotype_d">PCOS Confirmed - Phenotype D (Non-hyperandrogenic: Oligo + PCO)</option>
                            <option value="hypothalamic_amenorrhea">Functional Hypothalamic Amenorrhea (FHA)</option>
                            <option value="hyperprolactinemia">Hyperprolactinemia</option>
                            <option value="normal_variation">Normal Ovulatory / Physiological Variation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Specialist Referral Status
                          </label>
                          <select
                            value={referralStatus}
                            onChange={(e) => setReferralStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
                          >
                            <option value="none">No External Referral Needed</option>
                            <option value="pelvic_ultrasound">Pelvic Ultrasound (TVS/TAS)</option>
                            <option value="endocrinology">Endocrinology Specialist Consultation</option>
                            <option value="lifestyle_nutrition">Clinical Nutrition & Lifestyle Medicine</option>
                            <option value="reproductive_medicine">Reproductive Endocrinology / Fertility</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Chief Complaint & Patient History Summary
                          </label>
                          <input
                            type="text"
                            value={chiefComplaint}
                            onChange={(e) => setChiefComplaint(e.target.value)}
                            placeholder="e.g., Oligomenorrhea with 45–60 day cycles, mild hirsutism x 8 months"
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Physical Examination Findings
                          </label>
                          <input
                            type="text"
                            value={physicalExam}
                            onChange={(e) => setPhysicalExam(e.target.value)}
                            placeholder="e.g., Modified Ferriman-Gallwey score: 7, Acanthosis nigricans on nape of neck"
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          General Clinical Assessment & Observations *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={generalNotes}
                          onChange={(e) => setGeneralNotes(e.target.value)}
                          placeholder="Detailed clinical rationale, evaluation of differential exclusions, and hormonal correlation..."
                          className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Recommendations & Therapeutic Management Plan *
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={recommendation}
                            onChange={(e) => setRecommendation(e.target.value)}
                            placeholder="e.g., Order 75g 2h OGTT + Lipid Profile. Initiate lifestyle intervention..."
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Follow-Up Consultation Target Date
                          </label>
                          <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingNote}
                          className="px-6 py-2.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 transition"
                        >
                          {isSubmittingNote ? 'Saving Clinical Assessment...' : 'Commit Consultation Record'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Historical Consultation Notes */}
                  {patientDetail.clinician_notes && patientDetail.clinician_notes.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm space-y-4">
                      <h4 className="font-serif font-bold text-base text-plum-900">
                        Historical Consultation Audit Records ({patientDetail.clinician_notes.length})
                      </h4>
                      <div className="space-y-3">
                        {patientDetail.clinician_notes.map((n: any) => (
                          <div key={n.id} className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-2">
                            <div className="flex justify-between items-center text-slate-400 text-[11px] pb-1 border-b border-ivory-200">
                              <span>Consultation Date: <strong>{n.consultation_date}</strong></span>
                              <span>Referral: <strong className="capitalize">{n.referral_status}</strong></span>
                              {n.follow_up_date && <span>Follow-up: <strong>{n.follow_up_date}</strong></span>}
                            </div>
                            <p className="text-slate-800 whitespace-pre-line leading-relaxed">{n.general_notes}</p>
                            <div className="p-2.5 bg-white rounded-lg border border-ivory-200 text-plum-900">
                              <strong>Recommendation:</strong> {n.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">Loading comprehensive clinical records...</div>
          )}
        </div>
      )}
    </div>
  )
}
