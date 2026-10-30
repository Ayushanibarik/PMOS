import React from 'react'

export const TermsOfUsePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Legal Agreement</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-plum-900">Terms of Use</h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Terms governing the use of CycleAware software, services, and educational resources.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-plum-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or registering with CycleAware, you agree to comply with and be bound by these Terms of Use and our Medical Disclaimer.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-base text-plum-900">2. Age Eligibility</h2>
          <p>
            The automated risk-screening and cycle monitoring modules are intended for individuals aged 18 and above. Users under 18 may access educational information and age-appropriate tracking guidance, but adult diagnostic thresholds are strictly not applied to minors.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-base text-plum-900">3. Non-Emergency Disclaimer</h2>
          <p>
            CycleAware is not an emergency response service. In any medical emergency, please contact your local emergency services or visit the nearest emergency medical facility immediately.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-ivory-200">
          <h2 className="font-serif font-bold text-base text-plum-900">4. User Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for restricting access to your devices. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>
      </div>
    </div>
  )
}
