import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '../../services/api'

interface LoginPageProps {
  onLoginSuccess: (user: any) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.login({ email, password })
      localStorage.setItem('cycleaware_token', res.access_token)
      localStorage.setItem('cycleaware_user', JSON.stringify(res))
      onLoginSuccess(res)

      if (res.role === 'clinician') {
        navigate('/clinician')
      } else if (res.role === 'admin') {
        navigate('/admin')
      } else if (!res.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate('/app')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-ivory-300 shadow-elevated space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-plum-800 text-ivory-100 shadow-subtle mb-1">
            <Heart className="w-6 h-6 text-rose-300 fill-rose-300/30" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-plum-900">
            Sign In to CycleAware
          </h2>
          <p className="text-xs text-slate-500">
            Access your secure longitudinal hormonal health record
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cycleaware.local"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-9 py-2.5 border border-ivory-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-plum-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-plum-800 hover:bg-plum-700 text-white rounded-xl text-xs font-semibold shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Box */}
        <div className="pt-4 border-t border-ivory-200 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Development Demonstration Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('patient@cycleaware.local', 'DemoPatient123!')}
              className="py-1.5 px-2 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-lg text-[11px] font-semibold text-center transition-colors"
            >
              Patient Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('doctor@cycleaware.local', 'DemoDoctor123!')}
              className="py-1.5 px-2 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-lg text-[11px] font-semibold text-center transition-colors"
            >
              Doctor Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@cycleaware.local', 'DemoAdmin123!')}
              className="py-1.5 px-2 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-slate-700 rounded-lg text-[11px] font-semibold text-center transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-plum-800 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

