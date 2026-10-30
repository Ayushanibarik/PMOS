import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react'
import { api } from '../../services/api'

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Demographics
  const [age, setAge] = useState<number | ''>(26)
  const [menarcheAge, setMenarcheAge] = useState<number | ''>(13)
  const [country, setCountry] = useState('India')
  const [preferredLanguage, setPreferredLanguage] = useState('en')

  // Step 2: Menstrual History
  const [regularity, setRegularity] = useState('irregular')
  const [typicalLength, setTypicalLength] = useState<number | ''>(35)
  const [bleedingDuration, setBleedingDuration] = useState<number | ''>(5)
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-10-10')
  const [experiencesSkipped, setExperiencesSkipped] = useState(true)

  // Step 3: Health Context
  const [priorPcos, setPriorPcos] = useState(false)
  const [otherCondition, setOtherCondition] = useState(false)
  const [hormonalContraception, setHormonalContraception] = useState(false)
  const [isPregnant, setIsPregnant] = useState(false)

  // Step 4: Symptoms to Track
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'cramps', 'facial_acne', 'unwanted_facial_hair', 'sugar_cravings', 'fatigue'
  ])

  // Step 5: Consent
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentAnalytics, setConsentAnalytics] = useState(true)
  const [consentReminders, setConsentReminders] = useState(true)

  const toggleSymptom = (code: string) => {
    if (selectedSymptoms.includes(code)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== code))
    } else {
      setSelectedSymptoms([...selectedSymptoms, code])
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // 1. Update Profile
      await api.updateProfile({
        age: Number(age) || undefined,
        menarche_age: Number(menarcheAge) || undefined,
        country,
        preferred_language: preferredLanguage,
        cycle_regularity_self_report: regularity,
        typical_cycle_length: Number(typicalLength) || undefined,
        typical_bleeding_duration: Number(bleedingDuration) || undefined,
        last_period_date: lastPeriodDate || undefined,
        experiences_skipped_periods: experiencesSkipped,
        has_prior_pcos_diagnosis: priorPcos,
        has_other_endocrine_condition: otherCondition,
        using_hormonal_contraception: hormonalContraception,
        is_pregnant_postpartum: isPregnant,
        onboarding_completed: true
      })

      // 2. Update Consents
      await api.updateConsents([
        { consent_type: 'service_delivery', is_granted: true },
        { consent_type: 'research_participation', is_granted: consentResearch },
        { consent_type: 'product_analytics', is_granted: consentAnalytics },
        { consent_type: 'reminders', is_granted: consentReminders },
      ])

      // 3. If last period date provided, automatically create initial period entry
      if (lastPeriodDate) {
        try {
          await api.createPeriod({
            start_date: lastPeriodDate,
            flow_intensity: 'medium',
            notes: 'Initial period recorded during onboarding'
          })
        } catch {
          // Ignore if period already exists
        }
      }

      navigate('/app')
    } catch (err: any) {
      alert(`Could not save onboarding data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto bg-white p-8 rounded-3xl border border-ivory-300 shadow-elevated text-left space-y-6">
        {/* Header & Step Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
              Health Onboarding • Step {step} of 5
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {Math.round((step / 5) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-plum-800 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="font-serif text-2xl font-bold text-plum-900">
              Basic Profile & Menarche Context
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your age and age of first menstruation are essential to distinguish between normal pubertal ovulatory maturation and persistent adult ovulatory variations.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Age *
                </label>
                <input
                  type="number"
                  min={12}
                  max={60}
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Menarche Age (First Period)
                </label>
                <input
                  type="number"
                  min={9}
                  max={20}
                  value={menarcheAge}
                  onChange={(e) => setMenarcheAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Menstrual History */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="font-serif text-2xl font-bold text-plum-900">
              Menstrual History & Cycle Patterns
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell us about your general cycle experience. If you aren't sure, approximations are completely fine.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cycle Regularity Experience
              </label>
              <select
                value={regularity}
                onChange={(e) => setRegularity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
              >
                <option value="regular">Regular (Arrives within predictable 1-3 day window)</option>
                <option value="irregular">Irregular (Significant delays, skips, or varying dates)</option>
                <option value="uncertain">Uncertain / Just started tracking</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Typical Cycle Length (Days)
                </label>
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={typicalLength}
                  onChange={(e) => setTypicalLength(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bleeding Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={bleedingDuration}
                  onChange={(e) => setBleedingDuration(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Last Menstrual Period
              </label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="skip-check"
                checked={experiencesSkipped}
                onChange={(e) => setExperiencesSkipped(e.target.checked)}
                className="rounded text-plum-800 focus:ring-plum-700"
              />
              <label htmlFor="skip-check" className="text-xs text-slate-700">
                I experience skipped periods or intervals exceeding 45 days
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Existing Health Context */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="font-serif text-2xl font-bold text-plum-900">
              Existing Health Context (Optional)
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              These factors directly influence hormonal interpretation and menstrual bleeding.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-plum-900 block">Prior PCOS / PCOD / PMOS Diagnosis</span>
                  <span className="text-slate-400">Has a doctor previously diagnosed you?</span>
                </div>
                <input
                  type="checkbox"
                  checked={priorPcos}
                  onChange={(e) => setPriorPcos(e.target.checked)}
                  className="rounded text-plum-800"
                />
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-plum-900 block">Hormonal Contraception</span>
                  <span className="text-slate-400">Oral contraceptive pill, hormonal IUD, implant, or patch</span>
                </div>
                <input
                  type="checkbox"
                  checked={hormonalContraception}
                  onChange={(e) => setHormonalContraception(e.target.checked)}
                  className="rounded text-plum-800"
                />
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-plum-900 block">Other Endocrine Conditions</span>
                  <span className="text-slate-400">Thyroid disease, hyperprolactinemia, adrenal disorders</span>
                </div>
                <input
                  type="checkbox"
                  checked={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.checked)}
                  className="rounded text-plum-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Symptoms to Track */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="font-serif text-2xl font-bold text-plum-900">
              Select Symptoms to Track
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose symptoms you would like quick access to log in your daily journal.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { code: 'cramps', name: 'Pelvic Cramps' },
                { code: 'facial_acne', name: 'Facial Acne' },
                { code: 'unwanted_facial_hair', name: 'Facial Hair (Hirsutism)' },
                { code: 'hair_thinning', name: 'Scalp Hair Shedding' },
                { code: 'weight_fluctuations', name: 'Weight Fluctuations' },
                { code: 'sugar_cravings', name: 'Intense Sugar Cravings' },
                { code: 'fatigue', name: 'Chronic Fatigue' },
                { code: 'mood_swings', name: 'Mood Changes' },
                { code: 'sleep_disturbances', name: 'Sleep Disturbances' },
                { code: 'dark_skin_patches', name: 'Dark Skin Patches' },
              ].map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => toggleSymptom(s.code)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    selectedSymptoms.includes(s.code)
                      ? 'bg-plum-50 border-plum-300 text-plum-900 font-semibold'
                      : 'bg-white border-ivory-300 text-slate-600 hover:bg-ivory-50'
                  }`}
                >
                  <span>{s.name}</span>
                  {selectedSymptoms.includes(s.code) && (
                    <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Granular Privacy & Consent */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="font-serif text-2xl font-bold text-plum-900">
              Granular Consent & Governance
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              CycleAware adheres strictly to India DPDP Act 2023 principles. Optional permissions remain completely up to you.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sage-50 rounded-xl border border-sage-200">
                <div className="flex items-center gap-2 text-sage-900 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-sage-700" />
                  <span>Mandatory Core Service Delivery (Accepted)</span>
                </div>
                <p className="text-sage-800 text-[11px]">
                  Processing cycles, symptoms, and measurements necessary to display your personal dashboard.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-ivory-300 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-res"
                  checked={consentResearch}
                  onChange={(e) => setConsentResearch(e.target.checked)}
                  className="mt-0.5 rounded text-plum-800"
                />
                <label htmlFor="consent-res" className="space-y-0.5 cursor-pointer">
                  <span className="font-semibold text-plum-900 block">Optional Academic & Health Research</span>
                  <span className="text-slate-500 text-[11px] block">
                    Allow de-identified, non-identifiable aggregated statistics to contribute to female hormonal health research.
                  </span>
                </label>
              </div>

              <div className="p-3 bg-white rounded-xl border border-ivory-300 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-rem"
                  checked={consentReminders}
                  onChange={(e) => setConsentReminders(e.target.checked)}
                  className="mt-0.5 rounded text-plum-800"
                />
                <label htmlFor="consent-rem" className="space-y-0.5 cursor-pointer">
                  <span className="font-semibold text-plum-900 block">Cycle & Log Reminders</span>
                  <span className="text-slate-500 text-[11px] block">
                    Receive neutral, privacy-safe notifications to log period dates and symptom changes.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-ivory-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-ivory-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-ivory-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-plum-800 text-white rounded-xl text-xs font-semibold hover:bg-plum-700 transition-colors shadow-subtle"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-card transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Finalizing Profile...' : 'Complete & Open Dashboard'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
