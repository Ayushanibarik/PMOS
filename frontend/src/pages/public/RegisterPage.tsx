import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { api } from '../../services/api'

interface RegisterPageProps {
  onRegisterSuccess: (user: any) => void
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [ageConfirmed, setAgeConfirmed] = useState(true)
  const [consentService, setConsentService] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentService) {
      setError('You must accept the service delivery consent to create an account.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await api.register({
        full_name: fullName,
        email,
        password,
        role,
        age_confirmed: ageConfirmed
      })
      localStorage.setItem('cycleaware_token', res.access_token)
      localStorage.setItem('cycleaware_user', JSON.stringify(res))
      onRegisterSuccess(res)

      if (res.role === 'clinician') {
        navigate('/clinician')
      } else {
        navigate('/onboarding')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-ivory-300 shadow-elevated space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-plum-800 text-ivory-100 shadow-subtle mb-1">
            <Heart className="w-6 h-6 text-rose-300 fill-rose-300/30" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-plum-900">
            Create Your Health Profile
          </h2>
          <p className="text-xs text-slate-500">
            Begin maintaining your confidential hormonal health record
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name or Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aanya Sharma"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (Min 8 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700 bg-white"
            >
              <option value="patient">Patient / Individual User</option>
              <option value="clinician">Healthcare Professional / Clinician</option>
            </select>
          </div>

          {/* Age & Consent Checkboxes */}
          <div className="space-y-2.5 pt-2 border-t border-ivory-200 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="age-check"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-plum-800 focus:ring-plum-700"
              />
              <label htmlFor="age-check" className="text-[11px] leading-tight">
                I confirm I am 18 years of age or older (Users under 18 receive tailored pubertal educational guidance without automated adult risk scores).
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent-check"
                required
                checked={consentService}
                onChange={(e) => setConsentService(e.target.checked)}
                className="mt-0.5 rounded text-plum-800 focus:ring-plum-700"
              />
              <label htmlFor="consent-check" className="text-[11px] leading-tight">
                I consent to the processing of my health tracking data to provide the CycleAware service under the{' '}
                <Link to="/privacy-policy" className="text-plum-800 underline">Privacy Policy</Link> and{' '}
                <Link to="/medical-disclaimer" className="text-plum-800 underline">Clinical Disclaimer</Link>.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Continue to Health Onboarding'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-plum-800 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
