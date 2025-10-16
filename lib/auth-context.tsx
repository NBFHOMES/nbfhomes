"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'

declare global {
  interface Window {
    __fetchPatched?: boolean
  }
}

function patchFetch() {
  if (typeof window === 'undefined' || window.__fetchPatched) {
    return
  }

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

    let requestInit = init ? { ...init } : undefined

    if (typeof url === 'string' && url.startsWith('/api/')) {
      const token = auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null

      if (token) {
        const baseHeaders = requestInit?.headers ||
          (typeof input !== 'string' && !(input instanceof URL) ? input.headers : undefined)
        const headers = new Headers(baseHeaders)
        headers.set('Authorization', `Bearer ${token}`)

        if (requestInit) {
          requestInit.headers = headers
        } else if (typeof input === 'string' || input instanceof URL) {
          requestInit = { headers }
        } else {
          input = new Request(input, { headers })
          requestInit = undefined
        }
      }
    }

    return originalFetch(input, requestInit)
  }

  window.__fetchPatched = true
}

interface MongoUser {
  _id: string
  uid: string
  displayName: string
  email: string
  role: 'guest' | 'partner' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  phoneNumber?: string
  photoURL?: string
  bookingsCount: number
  propertiesCount: number
  totalSpent: number
  totalRevenue: number
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  businessInfo?: {
    companyName?: string
    taxId?: string
    businessLicense?: string
  }
}

interface AuthContextType {
  user: User | null
  mongoUser: MongoUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  mongoUser: null,
  loading: true,
  logout: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mongoUser, setMongoUser] = useState<MongoUser | null>(null)
  const [loading, setLoading] = useState(true)
  const debug = (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.log('[Auth]', ...args)
  }

  useEffect(() => {
    patchFetch()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      debug('onAuthStateChanged', !!firebaseUser)
      setUser(firebaseUser)

      if (firebaseUser) {
        // Fetch MongoDB user profile
        try {
          const token = await firebaseUser.getIdToken()
          // Establish server-side HttpOnly session cookie for middleware
          const sessionRes = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          debug('session set', sessionRes.ok)

          let mongoUserData = null

          // First try to find user by Firebase UID
          const uidResponse = await fetch(`/api/users?firebaseId=${firebaseUser.uid}`)
          debug('fetch by uid', uidResponse.status)
          if (uidResponse.ok) {
            mongoUserData = await uidResponse.json()
          } else {
            // If not found by UID, try to find by email
            const emailResponse = await fetch(`/api/users?email=${firebaseUser.email}`)
            debug('fetch by email', emailResponse.status)
            if (emailResponse.ok) {
              mongoUserData = await emailResponse.json()
              // Update the user's UID to match Firebase Auth
              const patchRes = await fetch(`/api/users/${mongoUserData._id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uid: firebaseUser.uid,
                  lastLogin: new Date()
                })
              })
              debug('patch user', patchRes.status)
              // Update local data
              mongoUserData.uid = firebaseUser.uid
              mongoUserData.lastLogin = new Date()
            }
          }

          if (mongoUserData) {
            setMongoUser(mongoUserData)
            debug('mongo user set')
          } else {
            // User doesn't exist in MongoDB, create them
            const newUserData = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'guest' as const,
              status: 'active' as const
            }

            try {
              const createResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
              })
              debug('create user', createResponse.status)

              if (createResponse.ok) {
                const newUser = await createResponse.json()
                setMongoUser(newUser.user)
              } else {
                // If creation failed, try to find existing user by email again
                const emailResponse = await fetch(`/api/users?email=${firebaseUser.email}`)
                debug('retry fetch by email', emailResponse.status)
                if (emailResponse.ok) {
                  const existingUser = await emailResponse.json()
                  setMongoUser(existingUser)
                } else {
                  debug('create/find user failed')
                }
              }
            } catch (error) {
              debug('create user error')
            }
          }
        } catch (error) {
          debug('failed to sync mongo user')
        }
      } else {
        setMongoUser(null)
        await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
        debug('session cleared')
      }

      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setMongoUser(null)
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, mongoUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
