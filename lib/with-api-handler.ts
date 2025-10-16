import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from './rate-limit'
import { logAuditEvent, AuditEvent } from './audit-log'

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse

interface HandlerOptions {
  rateLimit?: {
    windowMs: number
    max: number
  }
  audit?: Omit<AuditEvent, 'request'>
}

export function withApiHandler(handler: ApiHandler, options: HandlerOptions = {}) {
  return async (request: NextRequest, context?: any) => {
    // Apply rate limiting if specified
    if (options.rateLimit) {
      const rateLimitResponse = rateLimit(options.rateLimit)(request)
      if (rateLimitResponse) {
        // Log rate limit hit
        await logAuditEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          description: `Rate limit exceeded for ${request.nextUrl.pathname}`,
          request
        })
        return rateLimitResponse
      }
    }

    // Call the original handler
    const response = await handler(request, context)

    // Apply audit logging if specified
    if (options.audit) {
      await logAuditEvent({
        ...options.audit,
        request
      })
    }

    return response
  }
}