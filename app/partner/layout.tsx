"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from "@/components/navbar"
import { PartnerSidebar } from "@/components/partner/partner-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Loader2 } from "lucide-react"

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, mongoUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!mongoUser) {
        // MongoDB user not loaded yet
        return
      }

      if (mongoUser.status !== 'active') {
        router.push('/login?error=account_suspended')
        return
      }

      if (mongoUser.role !== 'partner') {
        router.push('/login?error=unauthorized')
        return
      }
    }
  }, [user, mongoUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !mongoUser || mongoUser.role !== 'partner' || mongoUser.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the partner panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Your partner application may still be under review. Please contact support if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <PartnerSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}