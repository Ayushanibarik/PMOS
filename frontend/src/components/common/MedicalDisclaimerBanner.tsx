import React, { useState } from 'react'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const MedicalDisclaimerBanner: React.FC = () => {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-plum-900 text-ivory-100 px-4 py-2 text-xs border-b border-plum-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-300 flex-shrink-0" />
          <span>
            <strong className="text-rose-200">Medical Safety Notice:</strong>{' '}
            {t('safety.bannerText')}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-ivory-200 hover:text-white p-1 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
