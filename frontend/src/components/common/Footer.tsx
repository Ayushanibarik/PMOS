import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, FileText, Lock } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-ivory-200 mt-20 pt-12 pb-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-ivory-200">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-plum-800 text-ivory-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-300 fill-rose-300/30" />
              </div>
              <span className="font-serif font-bold text-lg text-plum-900">
                CycleAware
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Women's Hormonal Health Intelligence Platform. Unifying longitudinal menstrual tracking,
              physiological observations, and transparent clinical guideline analysis.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-sage-700 bg-sage-50 px-2.5 py-1 rounded-md border border-sage-100 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>India DPDP Act 2023 Compliant</span>
            </div>
          </div>

          {/* Col 2: Health Intelligence */}
          <div>
            <h4 className="font-bold text-plum-900 uppercase tracking-wider text-[11px] mb-3">
              Health Intelligence
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/education" className="hover:text-plum-800 transition-colors">
                  Menstrual Biology & Cycles
                </Link>
              </li>
              <li>
                <Link to="/pcos-pmos-info" className="hover:text-plum-800 transition-colors">
                  PCOS vs PCOD vs PMOS (2026)
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-plum-800 transition-colors">
                  Longitudinal Health Monitoring
                </Link>
              </li>
              <li>
                <Link to="/education#guidelines" className="hover:text-plum-800 transition-colors">
                  2023 International Clinical Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical & Privacy Governance */}
          <div>
            <h4 className="font-bold text-plum-900 uppercase tracking-wider text-[11px] mb-3">
              Governance & Privacy
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-plum-800 transition-colors">
                  Privacy Policy & Data Rights
                </Link>
              </li>
              <li>
                <Link to="/medical-disclaimer" className="hover:text-plum-800 transition-colors">
                  Medical Safety & Non-Diagnostic Notice
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="hover:text-plum-800 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy#dpdp" className="hover:text-plum-800 transition-colors">
                  Consent Management & Data Erasure
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Portals */}
          <div>
            <h4 className="font-bold text-plum-900 uppercase tracking-wider text-[11px] mb-3">
              Access & Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-plum-800 transition-colors">
                  Patient Health Dashboard
                </Link>
              </li>
              <li>
                <Link to="/clinician" className="hover:text-plum-800 transition-colors">
                  Clinician Review Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-plum-800 transition-colors">
                  Administrator & Model Registry
                </Link>
              </li>
              <li>
                <a href="/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-plum-800 transition-colors">
                  API System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Callout */}
        <div className="pt-6 text-[11px] text-slate-400 space-y-2">
          <p>
            <strong>NON-DIAGNOSTIC NOTICE:</strong> CycleAware is designed to assist individuals in maintaining structured records of menstrual and physiological observations. It is not an automated medical diagnostic device, does not provide clinical diagnoses, and does not prescribe medical therapies. Software observations must be reviewed by qualified clinicians in the context of comprehensive history, physical examination, and appropriate laboratory or imaging evaluations.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-ivory-200">
            <div>
              &copy; {new Date().getFullYear()} CycleAware Health Technologies. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
              <Link to="/terms-of-use" className="hover:underline">Terms</Link>
              <Link to="/medical-disclaimer" className="hover:underline">Clinical Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

