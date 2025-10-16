"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          // Check user role from database
          const response = await fetch(`/api/users?firebaseId=${user.uid}`)
          if (response.ok) {
            const userData = await response.json()
            if (userData && userData.role === 'admin' && userData.status === 'active') {
              setUserRole('admin')
            } else {
              setUserRole('unauthorized')
            }
          } else {
            setUserRole('unauthorized')
          }
        } catch (error) {
          console.error('Error checking user role:', error)
          setUserRole('unauthorized')
        }
      }
      setCheckingRole(false)
    }

    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      checkUserRole()
    }
  }, [user, loading, router])

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact an administrator if you believe this is an error.
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
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}