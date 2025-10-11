import { authAdmin } from './firebase-admin'
import { NextRequest } from 'next/server'

export interface AuthUser {
  uid: string
  email?: string
  role?: string
  // Add other user properties as needed
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    let decodedToken: any = null
    if (authAdmin) {
      decodedToken = await authAdmin.verifyIdToken(token)
    } else if (process.env.NODE_ENV === 'development') {
      // Dev-only: decode token payload without verification to unblock local dev
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
          decodedToken = payload
        }
      } catch {
        return null
      }
    } else {
      return null
    }

    if (!decodedToken) return null

    // Get user role from database
    const { default: User } = await import('@/models/User')
    const userRecord = await User.findOne({ uid: decodedToken.uid || decodedToken.user_id || decodedToken.sub })
    // Do not log PII

    const role = userRecord?.role || 'guest'

    return {
      uid: decodedToken.uid || decodedToken.user_id || decodedToken.sub,
      email: decodedToken.email,
      role
    }
  } catch (error) {
    // Avoid leaking details
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await verifyToken(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(request: NextRequest, requiredRole: string): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (user.role !== requiredRole && user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}