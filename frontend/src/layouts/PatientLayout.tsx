import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  LayoutDashboard, 
  Calendar, 
  Activity, 
  Scale, 
  FileSpreadsheet, 
  Clock, 
  AlertCircle, 
  Share2, 
  ShieldCheck, 
  FileText,
  LogOut,
  Plus,
  X,
  Menu,
  Users
} from 'lucide-react'
import { MedicalDisclaimerBanner } from '../components/common/MedicalDisclaimerBanner'
import { api } from '../services/api'

interface PatientLayoutProps {
  user: any
  onLogout: () => void
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ user, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [logPeriodOpen, setLogPeriodOpen] = useState(false)
  
  // Quick Log Period State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [flow, setFlow] = useState('medium')
  const [spotting, setSpotting] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickLogPeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.createPeriod({
        start_date: startDate,
        end_date: endDate || undefined,
        flow_intensity: flow,
        has_spotting: spotting,
        notes: notes || undefined
      })
      setLogPeriodOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert(`Could not log period: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Cycle Tracker', path: '/app/cycles', icon: Calendar },
    { name: 'Symptom Journal', path: '/app/symptoms', icon: Activity },
    { name: 'Measurements', path: '/app/measurements', icon: Scale },
    { name: 'Clinical Reports', path: '/app/clinical-records', icon: FileSpreadsheet },
    { name: 'Unified Timeline', path: '/app/timeline', icon: Clock },
    { name: 'Pattern Observations', path: '/app/observations', icon: AlertCircle },
    { name: 'Reports & Export', path: '/app/reports', icon: FileText },
    { name: 'Doctor Sharing', path: '/app/sharing', icon: Share2 },
    { name: 'Privacy & Consent', path: '/app/privacy', icon: ShieldCheck },
    { name: 'ASHA Camp Mode', path: '/app/asha-camp', icon: Users },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100">
      <MedicalDisclaimerBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-ivory-300">
          {/* Brand */}
          <div className="p-4 border-b border-ivory-200 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-plum-800 text-ivory-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-300 fill-rose-300/30" />
              </div>
              <span className="font-serif font-bold text-lg text-plum-900">
                CycleAware
              </span>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-plum-800 text-white shadow-subtle'
                      : 'text-slate-600 hover:bg-ivory-100 hover:text-plum-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-200' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Bottom Card */}
          <div className="p-4 border-t border-ivory-200 bg-ivory-50 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-plum-900 truncate">
                {user?.full_name || 'Patient'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-plum-900 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="bg-white border-b border-ivory-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-plum-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-semibold text-plum-900 hidden sm:block">
                Patient Health Portal
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setLogPeriodOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-subtle transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Period</span>
              </button>
              <Link
                to="/app/symptoms"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-200 hover:bg-ivory-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Symptom</span>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Quick Log Period Modal */}
      {logPeriodOpen && (
        <div className="fixed inset-0 bg-plum-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-ivory-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-plum-900">
                Record Menstrual Period
              </h3>
              <button onClick={() => setLogPeriodOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickLogPeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flow Intensity
                </label>
                <select
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                >
                  <option value="very_light">Very Light</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="heavy">Heavy</option>
                  <option value="very_heavy">Very Heavy</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spotting-check"
                  checked={spotting}
                  onChange={(e) => setSpotting(e.target.checked)}
                  className="rounded text-plum-800 focus:ring-plum-700"
                />
                <label htmlFor="spotting-check" className="text-xs text-slate-700">
                  Includes spotting or irregular discharge
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Heavy cramping on day 1..."
                  className="w-full text-xs px-3 py-2 border border-ivory-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogPeriodOpen(false)}
                  className="px-4 py-2 border border-ivory-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-plum-800 hover:bg-plum-700 text-white rounded-lg text-xs font-semibold shadow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

