import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Heart, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Share2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Lock
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Evidence-Informed Hormonal Health Intelligence</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-plum-900 leading-[1.15]">
                {t('hero.headline')}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t('hero.subheadline')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-sm font-semibold shadow-card flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>{t('hero.startBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3.5 bg-white hover:bg-ivory-50 text-slate-700 border border-ivory-300 rounded-xl text-sm font-semibold shadow-subtle flex items-center justify-center gap-2 transition-all"
                >
                  <span>{t('hero.exploreBtn')}</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sage-500" />
                  <span>2023 International Clinical Guidelines</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sage-500" />
                  <span>Privacy-First & DPDP Act 2023</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Interactive Menstrual Timeline & Health Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-ivory-300 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-plum-900">Current Cycle: Day 18</div>
                      <div className="text-[10px] text-slate-400">Next predicted window in 12–15 days</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage-50 text-sage-700 border border-sage-200">
                    Sufficient History
                  </span>
                </div>

                {/* Timeline Visual Mock */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Cycle Lengths (Days)
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {[
                      { len: 38, irregular: true, tag: 'Cycle 1' },
                      { len: 44, irregular: true, tag: 'Cycle 2' },
                      { len: 36, irregular: true, tag: 'Cycle 3' },
                      { len: 52, irregular: true, tag: 'Cycle 4' },
                      { len: 40, irregular: true, tag: 'Cycle 5' }
                    ].map((c, i) => (
                      <div key={i} className="bg-ivory-50 p-2 rounded-xl border border-ivory-200">
                        <div className="text-base font-bold text-plum-900">{c.len}d</div>
                        <div className="text-[9px] text-rose-500 font-semibold">Outside ref</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Observation Card Mock */}
                <div className="bg-plum-50/70 p-3.5 rounded-2xl border border-plum-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-plum-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Evidence-Informed Observation</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    "4 of your last 5 cycles exceeded the 35-day adult reference threshold. 
                    Consider discussing ovulatory variability with your clinician."
                  </p>
                  <div className="text-[9px] text-lavender-500 font-medium">
                    Guideline: International PCOS/PMOS Guidelines 2023
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Clinician Access: Active</span>
                  <span className="font-semibold text-plum-800">CA-DEMO2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Why Menstrual Health Monitoring Matters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
            Why Menstrual Health Monitoring Matters
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Menstruation is often called the fifth vital sign. Your cycle length, ovulatory regularity,
            and hormonal fluctuations provide crucial clues about your metabolic and reproductive vitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-50 flex items-center justify-center text-plum-800">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-900">
              Longitudinal Perspective
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A single irregular period is rarely a sign of disease. True clinical evaluation requires
              understanding persistent trends across 3, 6, and 12 consecutive cycles.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-900">
              Beyond Isolated Symptoms
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acne, facial hair growth, or weight changes cannot be evaluated in a vacuum. CycleAware
              connects physical signs with your cycle calendar and clinical test results.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center text-sage-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-900">
              Empowering Clinicians
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of relying on memory during a 15-minute consultation, provide your gynecologist
              with verified dates, symptom frequency, and structured lab records.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: One Connected Health Profile */}
      <section className="bg-white py-20 border-y border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
                Connected Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
                One Unified Health Profile. All Your Records in Sync.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Traditional period trackers only record bleeding. CycleAware unites your full hormonal health ecosystem into a single chronological stream:
              </p>

              <div className="space-y-3 text-xs">
                {[
                  { title: 'Menstrual History', desc: 'Accurate cycle lengths, bleeding duration, and spotting markers.' },
                  { title: 'Symptom Journal', desc: 'Categorized severity logs for skin, hair, metabolic, and wellbeing changes.' },
                  { title: 'Physiological Markers', desc: 'Weight, BMI context, waist circumference, sleep, and resting heart rate.' },
                  { title: 'Clinical Laboratory Records', desc: 'Testosterone, Free Androgen Index, AMH, TSH, Fasting Glucose.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                    <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-plum-900 block">{item.title}</strong>
                      <span className="text-slate-500">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Box */}
            <div className="bg-ivory-50 rounded-3xl p-8 border border-ivory-300 space-y-4">
              <div className="text-xs font-bold text-plum-900 uppercase tracking-wider mb-2">
                Multi-Domain Correlation View
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-ivory-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-plum-900">Cycle Length Variability</div>
                    <div className="text-[11px] text-slate-500">Std deviation +/- 8.5 days across 5 cycles</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700">Irregular</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-ivory-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-plum-900">Skin & Hair Indicators</div>
                    <div className="text-[11px] text-slate-500">Persistent cystic acne & chin hirsutism logged</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-plum-50 text-plum-700">Elevated</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-ivory-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-plum-900">Metabolic Indicator</div>
                    <div className="text-[11px] text-slate-500">Waist: 86cm (Threshold &ge; 80cm for South Asian women)</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700">Watch</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-ivory-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-plum-900">Differential Labs Excluded</div>
                    <div className="text-[11px] text-slate-500">Normal TSH (2.4 mIU/L) & Prolactin (12.5 ng/mL)</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-sage-50 text-sage-700">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works 5 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
            Simple 5-Step Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
            How CycleAware Works
          </h2>
          <p className="text-slate-600 text-sm">
            Empowering your personal health journey with transparency and medical responsibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Create Profile', desc: 'Set up your age, menarche background, and privacy consent preferences.' },
            { step: '02', title: 'Track Cycles', desc: 'Log period dates, flow intensity, and spotting as cycles occur.' },
            { step: '03', title: 'Record Symptoms', desc: 'Note skin, hair, sleep, and metabolic changes whenever noticed.' },
            { step: '04', title: 'Review Trends', desc: 'Explore statistical variations and evidence-informed pattern flags.' },
            { step: '05', title: 'Share with Doctor', desc: 'Generate PDF reports or share direct read-only access with your clinician.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-subtle space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-serif text-2xl font-bold text-lavender-400 block mb-1">
                  {item.step}
                </span>
                <h3 className="font-serif font-bold text-base text-plum-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="font-serif text-3xl font-bold text-plum-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {[
            {
              q: "Does CycleAware diagnose PCOS, PCOD, or PMOS?",
              a: "No. CycleAware is strictly an early-pattern identification and health monitoring tool. A definitive diagnosis requires comprehensive clinical evaluation by a qualified doctor, physical examination, and selective hormonal testing or ultrasound."
            },
            {
              q: "What is the difference between PCOS, PCOD, and PMOS?",
              a: "PCOD is a widely used colloquial term in India, while PCOS has been the established historical international term. On 12 May 2026, international consensus introduced 'PMOS' (Polycystic Metabolic Ovarian Syndrome) to emphasize the metabolic and endocrine nature of the condition rather than ovarian morphology alone. They refer to the same clinical spectrum."
            },
            {
              q: "Can adolescents use CycleAware?",
              a: "Yes, but with strict clinical safeguards. In young women within 1–3 years of menarche, irregular periods are often a normal part of pubertal transition. International guidelines caution against using ultrasound or AMH for diagnosis in adolescents. CycleAware provides age-appropriate guidance and does not apply adult diagnostic thresholds to minors."
            },
            {
              q: "Who can see my personal health records?",
              a: "Only you. Clinicians can only view your records if you generate a secure access code and explicitly grant them time-limited access. You can revoke access at any time with a single click."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-ivory-300 space-y-2">
              <h3 className="font-bold text-sm text-plum-900">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-plum-900 text-ivory-100 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white max-w-2xl mx-auto">
            Take Control of Your Hormonal Wellbeing Today
          </h2>
          <p className="text-sm sm:text-base text-ivory-200 max-w-xl mx-auto">
            Join women tracking their health with evidence-informed clarity, robust privacy protections, and seamless clinician collaboration.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-card transition-all"
            >
              Get Started with CycleAware
            </Link>
            <Link
              to="/education"
              className="px-6 py-3.5 bg-plum-800 hover:bg-plum-700 text-ivory-100 border border-plum-700 rounded-xl text-sm font-semibold transition-all"
            >
              Read Health Education Guides
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
