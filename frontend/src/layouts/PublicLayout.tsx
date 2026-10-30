import React from 'react'
import { Outlet } from 'react-router-dom'
import { MedicalDisclaimerBanner } from '../components/common/MedicalDisclaimerBanner'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

interface PublicLayoutProps {
  user?: any
  onLogout?: () => void
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-100">
      <MedicalDisclaimerBanner />
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
