"use client"

import * as React from "react"
import { SharePopup } from "./share-popup"

interface SharePopupProviderProps {
  children: React.ReactNode
}

export function SharePopupProvider({ children }: SharePopupProviderProps) {
  const [showSharePopup, setShowSharePopup] = React.useState(false)
  const [lastVisitTime, setLastVisitTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const STORAGE_KEY = 'stayhub_last_share_popup'
    const INTERVAL_MINUTES = 5

    // Get last popup display time
    const getLastPopupTime = () => {
      try {
        return localStorage.getItem(STORAGE_KEY)
      } catch {
        return null
      }
    }

    // Set popup display time
    const setLastPopupTime = () => {
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString())
      } catch {
        // Ignore localStorage errors
      }
    }

    // Check if we should show the popup
    const shouldShowPopup = () => {
      const lastPopupTime = getLastPopupTime()

      if (!lastPopupTime) {
        return true // First visit
      }

      const now = new Date()
      const lastPopup = new Date(lastPopupTime)
      const diffInMinutes = Math.floor((now.getTime() - lastPopup.getTime()) / (1000 * 60))

      return diffInMinutes >= INTERVAL_MINUTES
    }

    // Initial check on mount
    if (shouldShowPopup()) {
      // Wait 30 seconds before showing first popup
      const initialTimer = setTimeout(() => {
        setShowSharePopup(true)
        setLastPopupTime()
        setLastVisitTime(new Date().toISOString())
      }, 30000) // 30 seconds

      return () => clearTimeout(initialTimer)
    } else {
      setLastVisitTime(getLastPopupTime())
    }

    // Set up interval for recurring checks
    const interval = setInterval(() => {
      if (shouldShowPopup()) {
        setShowSharePopup(true)
        setLastPopupTime()
        setLastVisitTime(new Date().toISOString())
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const handleClosePopup = () => {
    setShowSharePopup(false)
  }

  return (
    <>
      {children}
      <SharePopup
        isOpen={showSharePopup}
        onClose={handleClosePopup}
        title="NBFHOMES - Premium Hotel Booking Platform"
        description="Discover premium hotels and accommodations worldwide with NBFHOMES!"
      />
    </>
  )
}