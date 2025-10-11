import { NextRequest } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
  message?: string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options

  return (request: NextRequest) => {
    const fwd = request.headers.get('x-forwarded-for') || ''
    const firstFwd = fwd.split(',')[0]?.trim()
    const ip = firstFwd || (request as any).ip || 'unknown'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      return null // Allow
    }

    if (store[key].count >= max) {
      return new Response(message, {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString(),
          'Content-Type': 'text/plain'
        }
      })
    }

    store[key].count++
    return null // Allow
  }
}

// Clean up expired entries periodically (simple implementation)
const MAX_KEYS = 10000
setInterval(() => {
  const now = Date.now()
  // Remove expired keys
  for (const key of Object.keys(store)) {
    if (now > store[key].resetTime) delete store[key]
  }
  // Hard cap store size
  const keys = Object.keys(store)
  if (keys.length > MAX_KEYS) {
    const overflow = keys.length - MAX_KEYS
    for (let i = 0; i < overflow; i++) {
      delete store[keys[i]]
    }
  }
}, 60000) // Clean every minute