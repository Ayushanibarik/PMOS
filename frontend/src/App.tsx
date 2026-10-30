import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { PatientLayout } from './layouts/PatientLayout'
import { LandingPage } from './pages/public/LandingPage'
import { AboutPage } from './pages/public/AboutPage'
import { HowItWorksPage } from './pages/public/HowItWorksPage'
import { EducationPage } from './pages/public/EducationPage'
import { PcosPmosInfoPage } from './pages/public/PcosPmosInfoPage'
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage'
import { MedicalDisclaimerPage } from './pages/public/MedicalDisclaimerPage'
import { TermsOfUsePage } from './pages/public/TermsOfUsePage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { OnboardingWizard } from './pages/patient/OnboardingWizard'
import { PatientDashboard } from './pages/patient/PatientDashboard'
import { CycleTrackerPage } from './pages/patient/CycleTrackerPage'
import { SymptomJournalPage } from './pages/patient/SymptomJournalPage'
import { HealthMeasurementsPage } from './pages/patient/HealthMeasurementsPage'
import { ClinicalReportsPage } from './pages/patient/ClinicalReportsPage'
import { UnifiedTimelinePage } from './pages/patient/UnifiedTimelinePage'
import { PatternObservationsPage } from './pages/patient/PatternObservationsPage'
import { ReportsPage } from './pages/patient/ReportsPage'
import { DoctorSharingPage } from './pages/patient/DoctorSharingPage'
import { PrivacySettingsPage } from './pages/patient/PrivacySettingsPage'
import { ClinicianDashboard } from './pages/clinician/ClinicianDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { api } from './services/api'

export const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('cycleaware_user')
    const token = localStorage.getItem('cycleaware_token')
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Fallback
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    api.logout()
    setUser(null)
    window.location.href = '/'
  }

  if (loading) {
    return <div className="min-h-screen bg-ivory-100 flex items-center justify-center text-xs text-slate-400">Loading CycleAware...</div>
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/pcos-pmos-info" element={<PcosPmosInfoPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={setUser} />} />
        <Route path="/register" element={<RegisterPage onRegisterSuccess={setUser} />} />
      </Route>

      {/* Onboarding Wizard */}
      <Route path="/onboarding" element={<OnboardingWizard />} />

      {/* Patient App Shell */}
      <Route path="/app" element={user ? <PatientLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
        <Route index element={<PatientDashboard />} />
        <Route path="cycles" element={<CycleTrackerPage />} />
        <Route path="symptoms" element={<SymptomJournalPage />} />
        <Route path="measurements" element={<HealthMeasurementsPage />} />
        <Route path="clinical-records" element={<ClinicalReportsPage />} />
        <Route path="timeline" element={<UnifiedTimelinePage />} />
        <Route path="observations" element={<PatternObservationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="sharing" element={<DoctorSharingPage />} />
        <Route path="privacy" element={<PrivacySettingsPage />} />
      </Route>

      {/* Clinician Portal Shell */}
      <Route path="/clinician" element={<ClinicianDashboard />} />

      {/* Admin Portal Shell */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
