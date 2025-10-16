import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, verifyToken } from '@/lib/auth'

// POST /api/auth/session - Set HttpOnly session cookie from Authorization header token
export async function POST(request: NextRequest) {
  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify token; in dev, accept decoded token without signature
  const user = await verifyToken(request)
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, uid: user?.uid || 'dev' })
  res.cookies.set('firebase_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })
  return res
}

// DELETE /api/auth/session - Clear session cookie
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('firebase_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  })
  return res
}
