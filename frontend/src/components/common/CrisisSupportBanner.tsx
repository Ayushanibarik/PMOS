import React from 'react'
import { PhoneCall, HeartHandshake, ShieldAlert } from 'lucide-react'

export const CrisisSupportBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 mt-0.5 sm:mt-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-plum-900 flex items-center gap-1.5">
              Hormonal & Emotional Wellbeing Support
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Hormonal fluctuations can intensely affect emotional health. If you are experiencing overwhelming distress, free, confidential clinical help is available 24/7.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:14416"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Tele-MANAS: 14416 (India)
          </a>
          <a
            href="tel:988"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 text-white rounded-lg shadow-sm hover:bg-slate-800 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            988 (International)
          </a>
        </div>
      </div>
    </div>
  )
}
