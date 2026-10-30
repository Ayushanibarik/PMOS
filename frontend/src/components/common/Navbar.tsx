import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Heart, 
  Globe, 
  Menu, 
  X, 
  User as UserIcon, 
  Stethoscope, 
  ShieldCheck, 
  LogOut
} from 'lucide-react'
import { api } from '../../services/api'

interface NavbarProps {
  user?: any
  onLogout?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoMenuOpen, setDemoMenuOpen] = useState(false)

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const quickDemoLogin = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass })
      localStorage.setItem('cycleaware_token', res.access_token)
      localStorage.setItem('cycleaware_user', JSON.stringify(res))
      setDemoMenuOpen(false)
      if (res.role === 'clinician') {
        navigate('/clinician')
      } else if (res.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/app')
      }
      window.location.reload()
    } catch (err: any) {
      alert(`Demo login error: ${err.message}`)
    }
  }

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-ivory-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-plum-800 text-ivory-100 flex items-center justify-center shadow-subtle group-hover:bg-plum-700 transition-colors">
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300/30" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-plum-900 tracking-tight leading-none">
                CycleAware
              </span>
              <span className="text-[10px] text-lavender-500 font-medium tracking-wider uppercase mt-0.5">
                Hormonal Health Intel
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-plum-800 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/how-it-works" className="hover:text-plum-800 transition-colors">
              {t('nav.howItWorks')}
            </Link>
            <Link to="/education" className="hover:text-plum-800 transition-colors">
              {t('nav.education')}
            </Link>
            <Link to="/pcos-pmos-info" className="hover:text-plum-800 transition-colors">
              {t('nav.pcosPmos')}
            </Link>
          </nav>

          {/* Right Section: Language, Demo Fast-Login, Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center gap-1 bg-ivory-100 border border-ivory-300 rounded-lg px-2.5 py-1 text-xs text-slate-600">
              <Globe className="w-3.5 h-3.5 text-lavender-500" />
              <select
                aria-label="Select Language"
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="or">ଓଡ଼ିଆ (Odia)</option>
              </select>
            </div>

            {/* Demo Fast-Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                title="Quick switch demonstration accounts"
              >
                <UserIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Demo Accounts</span>
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-ivory-300 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Synthetic Demo Profiles
                  </div>
                  <button
                    onClick={() => quickDemoLogin('patient@cycleaware.local', 'DemoPatient123!')}
                    className="w-full text-left px-2.5 py-2 hover:bg-ivory-100 rounded-lg flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-plum-600" />
                    <div>
                      <div className="font-semibold text-plum-900">Aanya Sharma (Patient)</div>
                      <div className="text-[10px] text-slate-400">6 Cycles, Symptoms & Labs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => quickDemoLogin('doctor@cycleaware.local', 'DemoDoctor123!')}
                    className="w-full text-left px-2.5 py-2 hover:bg-ivory-100 rounded-lg flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-sage-500" />
                    <div>
                      <div className="font-semibold text-sage-700">Dr. Priya Mukherjee (MD)</div>
                      <div className="text-[10px] text-slate-400">Clinician Portal & Consultations</div>
                    </div>
                  </button>
                  <button
                    onClick={() => quickDemoLogin('admin@cycleaware.local', 'DemoAdmin123!')}
                    className="w-full text-left px-2.5 py-2 hover:bg-ivory-100 rounded-lg flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-plum-700" />
                    <div>
                      <div className="font-semibold text-plum-900">Platform Admin</div>
                      <div className="text-[10px] text-slate-400">Model Registry & Audits</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'clinician' ? '/clinician' : user.role === 'admin' ? '/admin' : '/app'}
                  className="px-3.5 py-1.5 bg-plum-800 text-white rounded-lg text-xs font-medium hover:bg-plum-700 transition-colors shadow-subtle"
                >
                  {user.role === 'clinician' ? 'Doctor Portal' : user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                </Link>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-ivory-200 rounded-lg transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-plum-800 hover:text-plum-900 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-plum-800 text-white rounded-lg text-xs font-semibold hover:bg-plum-700 transition-colors shadow-subtle"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-plum-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-ivory-300 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-plum-800"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-plum-800"
          >
            {t('nav.howItWorks')}
          </Link>
          <Link
            to="/education"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-plum-800"
          >
            {t('nav.education')}
          </Link>
          <Link
            to="/pcos-pmos-info"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-plum-800"
          >
            {t('nav.pcosPmos')}
          </Link>

          <div className="pt-3 border-t border-ivory-200 flex flex-col gap-2">
            <div className="text-xs text-slate-400 font-medium">Quick Demo Profiles</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickDemoLogin('patient@cycleaware.local', 'DemoPatient123!')}
                className="py-1.5 px-2 bg-rose-50 text-rose-700 rounded text-xs font-semibold text-center"
              >
                Patient
              </button>
              <button
                onClick={() => quickDemoLogin('doctor@cycleaware.local', 'DemoDoctor123!')}
                className="py-1.5 px-2 bg-sage-50 text-sage-700 rounded text-xs font-semibold text-center"
              >
                Doctor
              </button>
              <button
                onClick={() => quickDemoLogin('admin@cycleaware.local', 'DemoAdmin123!')}
                className="py-1.5 px-2 bg-plum-50 text-plum-700 rounded text-xs font-semibold text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Language:</span>
            <div className="flex gap-2 text-xs">
              <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-plum-800 text-white font-bold' : 'text-slate-600'}`}>EN</button>
              <button onClick={() => handleLanguageChange('hi')} className={`px-2 py-1 rounded ${i18n.language === 'hi' ? 'bg-plum-800 text-white font-bold' : 'text-slate-600'}`}>HI</button>
              <button onClick={() => handleLanguageChange('or')} className={`px-2 py-1 rounded ${i18n.language === 'or' ? 'bg-plum-800 text-white font-bold' : 'text-slate-600'}`}>OR</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

