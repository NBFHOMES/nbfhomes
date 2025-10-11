import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    const tokenCookie = request.cookies.get('firebase_token')?.value

    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader
      : tokenCookie
        ? `Bearer ${tokenCookie}`
        : null

    if (!bearerToken) {
      const loginUrl = new URL('/login?error=unauthorized', request.nextUrl)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const verifyUrl = request.nextUrl.clone()
      verifyUrl.pathname = '/api/auth/verify-admin'
      verifyUrl.search = ''

      const verifyResponse = await fetch(verifyUrl, {
        headers: {
          authorization: bearerToken
        },
        cache: 'no-store'
      })

      if (!verifyResponse.ok) {
        const loginUrl = new URL('/login?error=unauthorized', request.nextUrl)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      const loginUrl = new URL('/login?error=unauthorized', request.nextUrl)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}