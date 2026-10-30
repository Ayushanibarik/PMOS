import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Activity, Heart, HelpCircle, CheckCircle2 } from 'lucide-react'

export const EducationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
          Reproductive Health Literacy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          The Science of Menstrual Cycles
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Understanding the hormonal orchestrations behind your period empowers you to distinguish
          between natural bodily fluctuations and patterns that warrant medical attention.
        </p>
      </div>

      {/* Phases of the Cycle */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          The Four Phases of the Ovarian & Menstrual Cycle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
            <div className="font-bold text-sm text-plum-900">1. Menstrual Phase (Days 1–5)</div>
            <p className="text-slate-600 leading-relaxed">
              Estrogen and progesterone drop if fertilization did not occur, triggering the shedding
              of the functional endometrial lining. Day 1 of bleeding marks Day 1 of your cycle.
            </p>
          </div>

          <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
            <div className="font-bold text-sm text-plum-900">2. Follicular Phase (Days 1–14)</div>
            <p className="text-slate-600 leading-relaxed">
              Follicle Stimulating Hormone (FSH) promotes follicle development in the ovaries.
              Rising estradiol stimulates endometrial thickening and changes cervical mucus.
            </p>
          </div>

          <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
            <div className="font-bold text-sm text-plum-900">3. Ovulatory Phase (Around Day 14)</div>
            <p className="text-slate-600 leading-relaxed">
              A surge in Luteinizing Hormone (LH) triggers the release of a mature ovum from the dominant follicle.
              Ovulation timing varies significantly between women and cycles.
            </p>
          </div>

          <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
            <div className="font-bold text-sm text-plum-900">4. Luteal Phase (Days 15–28)</div>
            <p className="text-slate-600 leading-relaxed">
              The ruptured follicle transforms into the corpus luteum, secreting progesterone to support
              the endometrium. The luteal phase typically lasts 12 to 14 days.
            </p>
          </div>
        </div>
      </div>

      {/* When to consult a doctor */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rose-600" />
          <span>Recommended Questions for Your Healthcare Provider</span>
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <span>"My cycle length has varied between [X] and [Y] days over my last 6 recorded cycles. Does this indicate oligo-ovulation?"</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <span>"Given my symptoms of [acne / hair growth / fatigue], are laboratory evaluations for free testosterone, FAI, or fasting insulin indicated?"</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <span>"Have alternative endocrine conditions such as hypothyroidism (TSH) or hyperprolactinemia been ruled out in my case?"</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
