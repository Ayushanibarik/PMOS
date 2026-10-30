import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, ShieldCheck, Heart, Stethoscope } from 'lucide-react'

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
          Step-by-Step Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          How CycleAware Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          From your first logged period to clinical consultation summaries, CycleAware maintains an
          evidence-informed longitudinal view of your reproductive health.
        </p>
      </div>

      <div className="space-y-8">
        {[
          {
            step: '01',
            title: 'Create Your Personal Profile',
            desc: 'Provide baseline demographics such as age and menarche background. This allows our clinical rule engine to apply life-stage-specific reference bounds (adolescents vs adult ovulatory criteria).'
          },
          {
            step: '02',
            title: 'Track Cycles & Symptoms Chronologically',
            desc: 'Log the start and end dates of each period. Add flow intensity, spotting, and categorized symptoms (facial acne, hirsutism, hair shedding, fatigue, sugar cravings).'
          },
          {
            step: '03',
            title: 'Add Optional Measurements & Clinical Reports',
            desc: 'Log body measurements (weight, waist circumference, blood pressure) and enter clinical laboratory results (Total/Free Testosterone, AMH, Fasting Glucose, TSH).'
          },
          {
            step: '04',
            title: 'Analyze Statistical & Guideline Patterns',
            desc: 'CycleAware computes mean cycle length, median, variation, and guideline irregularity flags. When 3 or more cycles exist, a statistical prediction window is computed.'
          },
          {
            step: '05',
            title: 'Collaborate Securely with Authorized Clinicians',
            desc: 'Export a PDF summary or generate a secure, time-limited access code for your doctor. Clinicians can review your trends and add consultation notes without altering your original records.'
          }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle flex gap-6 items-start">
            <span className="font-serif text-3xl font-bold text-lavender-400 flex-shrink-0">
              {s.step}
            </span>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-lg text-plum-900">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 text-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-plum-800 text-white rounded-xl text-sm font-semibold hover:bg-plum-700 transition-colors shadow-card"
        >
          <span>Begin Your Health Record</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

