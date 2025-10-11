import { NextRequest } from 'next/server'
import SecurityEvent from '@/models/SecurityEvent'

export interface AuditEvent {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'profile_update' | 'suspicious_activity' | 'unauthorized_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  userEmail?: string
  description: string
  metadata?: any
  request?: NextRequest
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    const { request, ...eventData } = event

    // For location, in production use a geo IP service like ipapi.co or maxmind
    // For now, we'll skip location data to avoid external API calls
    const location = undefined

    await SecurityEvent.create({
      ...eventData,
      ipAddress: request ? (request.ip || request.headers.get('x-forwarded-for') as string) : undefined,
      userAgent: request ? request.headers.get('user-agent') : undefined,
      location
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
    // Don't throw, just log the error
  }
}