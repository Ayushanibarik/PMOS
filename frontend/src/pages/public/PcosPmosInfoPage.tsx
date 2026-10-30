import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShieldAlert, CheckCircle2, BookOpen, Stethoscope } from 'lucide-react'

export const PcosPmosInfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clinical Terminology & Medical Science</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          Understanding PCOS, PCOD, and PMOS (2026 Terminology)
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Women frequently encounter differing terms—PCOD, PCOS, and PMOS—across clinics, laboratory reports,
          and health articles. Here is what modern endocrinology and international guidelines establish.
        </p>
      </div>

      {/* Nomenclature Clarification Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          One Spectrum: Are PCOD, PCOS, and PMOS Different Diseases?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong>No.</strong> They represent the same underlying endocrine and metabolic spectrum.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-ivory-50 p-4 rounded-xl border border-ivory-200 text-xs space-y-1.5">
            <div className="font-bold text-plum-900">PCOD (Polycystic Ovarian Disease)</div>
            <div className="text-slate-500">
              Commonly used in India and South Asia as a legacy lay term. Clinically, it is not a separate disease from PCOS.
            </div>
          </div>
          <div className="bg-ivory-50 p-4 rounded-xl border border-ivory-200 text-xs space-y-1.5">
            <div className="font-bold text-plum-900">PCOS (Polycystic Ovary Syndrome)</div>
            <div className="text-slate-500">
              The formal international clinical term established since the 1990 NIH and 2003 Rotterdam consensus criteria.
            </div>
          </div>
          <div className="bg-plum-50 p-4 rounded-xl border border-plum-200 text-xs space-y-1.5">
            <div className="font-bold text-plum-900">PMOS (Polycystic Metabolic Ovarian Syndrome)</div>
            <div className="text-plum-700">
              Introduced internationally on 12 May 2026 to emphasize the central cardiometabolic, insulin, and hormonal components rather than ovarian morphology alone.
            </div>
          </div>
        </div>
      </div>

      {/* The 2023 International Guideline Rotterdam Criteria */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-5">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          How PCOS / PMOS Is Clinically Evaluated
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          According to the 2023 International Evidence-Based Guideline, in adult women, diagnosis requires at least <strong>two of the following three criteria</strong>, along with the strict exclusion of alternative causes:
        </p>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-plum-900 block">1. Ovulatory Dysfunction (Oligo- or Anovulation)</strong>
              <span className="text-slate-500">
                Cycles consistently &lt; 21 days or &gt; 35 days, or fewer than 8 cycles per year (in adults &ge;3 years post-menarche).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-plum-900 block">2. Clinical and/or Biochemical Hyperandrogenism</strong>
              <span className="text-slate-500">
                Clinical signs: Hirsutism (excessive terminal hair growth), female pattern hair loss, or persistent cystic acne. 
                Biochemical: Elevated calculated Free Testosterone or Free Androgen Index (FAI).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-plum-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-plum-900 block">3. Polycystic Ovarian Morphology on Ultrasound (or elevated AMH in adults)</strong>
              <span className="text-slate-500">
                High follicle number per ovary (&ge;20 follicles) or increased ovarian volume (&ge;10 ml). 
                <em>Note: This criterion does NOT apply to adolescents within 8 years of menarche.</em>
              </span>
            </div>
          </div>
        </div>

        {/* Exclusion of alternative causes */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-rose-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Essential Clinical Rule: Exclusion of Alternative Mimicking Pathologies</span>
          </div>
          <p className="text-rose-900/80 leading-relaxed">
            Thyroid disorders (elevated TSH), hyperprolactinemia (elevated prolactin), and non-classic congenital adrenal hyperplasia (elevated 17-OHP) must be formally ruled out by your physician before establishing a diagnosis.
          </p>
        </div>
      </div>

      {/* Adolescent Specific Guidance */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Adolescent Safety Framework
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          During adolescence (especially within 1–3 years post-menarche), multi-follicular ovaries and irregular cycles are normal physiological stages of pubertal maturation.
          The 2023 International Guideline explicitly advises against using pelvic ultrasound or serum AMH as diagnostic markers in young women within 8 years of menarche due to high false-positive rates.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          If concerns arise in adolescents, evaluation focuses on clinical hyperandrogenism and persistent ovulatory dysfunction, with re-evaluation after gynecological maturity.
        </p>
      </div>
    </div>
  )
}

