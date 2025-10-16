"use client"
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRoleAccess(requiredRole: string, redirectTo: string = '/login') {
  const { user, mongoUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated
        router.push(redirectTo)
        return
      }

      if (!mongoUser) {
        // MongoDB user not loaded yet
        return
      }

      if (mongoUser.status !== 'active') {
        // User account is not active
        router.push('/login?error=account_suspended')
        return
      }

      if (mongoUser.role !== requiredRole) {
        // User doesn't have required role
        router.push('/login?error=unauthorized')
        return
      }
    }
  }, [user, mongoUser, loading, requiredRole, redirectTo, router])

  return {
    isAuthorized: !loading && user && mongoUser && mongoUser.status === 'active' && mongoUser.role === requiredRole,
    loading,
    user,
    mongoUser
  }
}