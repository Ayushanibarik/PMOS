import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, Stethoscope, Users, CheckCircle2 } from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-plum-700">
          About CycleAware
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">
          Transforming Menstrual & Hormonal Health Monitoring
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          CycleAware was founded on a simple principle: women deserve clear, scientifically grounded,
          and transparent health intelligence. We bridge the gap between basic calendar tracking and
          complex endocrinological evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-800 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-900">Clinical Integrity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every rule and threshold in CycleAware is derived directly from peer-reviewed evidence and the
            2023 International Evidence-Based Guideline for PCOS/PMOS.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-900">Privacy & Consent</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built from day one in compliance with India's Digital Personal Data Protection (DPDP) Act, 2023.
            Your sensitive health records are never sold or shared without explicit, granular consent.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-900">Doctor-Patient Alignment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our goal is not to replace clinicians, but to equip both patients and doctors with structured,
            longitudinal data to make consultations far more efficient and accurate.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-ivory-300 space-y-4">
        <h2 className="font-serif font-bold text-xl text-plum-900">
          Our Non-Diagnostic Commitment
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          PCOS (and PMOS) is a complex multi-system endocrine condition. It cannot and should never be
          diagnosed by an automated smartphone application based on self-reported acne or irregular periods alone.
          CycleAware adheres strictly to clinical safety boundaries: we flag statistical variations and
          encourage timely, informed medical consultation with qualified gynecologists and endocrinologists.
        </p>
      </div>
    </div>
  )
}
