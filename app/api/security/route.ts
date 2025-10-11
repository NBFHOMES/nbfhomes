import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SecurityEvent from '@/models/SecurityEvent'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const createSecurityEventSchema = z.object({
  type: z.enum(['login', 'logout', 'failed_login', 'password_change', 'profile_update', 'suspicious_activity', 'unauthorized_access']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }).optional(),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional()
})

// GET /api/security - Get security events and stats
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (type) filter.type = type
    if (severity) filter.severity = severity
    if (resolved !== null) filter.resolved = resolved === 'true'
    if (userId) filter.userId = userId

    // Get security events
    const events = await SecurityEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await SecurityEvent.countDocuments(filter)

    // Get active sessions (recent login events without logout)
    const activeSessions = await SecurityEvent.aggregate([
      {
        $match: {
          type: 'login',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'uid',
          as: 'user'
        }
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$userId',
          lastLogin: { $max: '$createdAt' },
          loginCount: { $sum: 1 },
          user: { $first: '$user' },
          ipAddress: { $last: '$ipAddress' },
          userAgent: { $last: '$userAgent' }
        }
      },
      {
        $match: {
          // Consider active if last login within 8 hours and no recent logout
          lastLogin: { $gte: new Date(Date.now() - 8 * 60 * 60 * 1000) }
        }
      },
      {
        $project: {
          id: '$_id',
          userId: '$_id',
          userName: '$user.displayName',
          userEmail: '$user.email',
          ipAddress: 1,
          userAgent: 1,
          lastActivity: '$lastLogin',
          status: 'active'
        }
      }
    ])

    // Get unresolved alerts
    const securityAlerts = await SecurityEvent.find({
      resolved: false,
      severity: { $in: ['high', 'critical'] }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    // Get system health stats (placeholder - implement real monitoring)
    const systemHealth = {
      firewallStatus: 'unknown',
      encryptionStatus: 'unknown',
      backupStatus: 'unknown',
      sslCertificate: 'unknown',
      serverLoad: 0,
      databaseConnections: 0
    }

    // Get recent access logs (last 100 events)
    const accessLogs = await SecurityEvent.find({
      type: { $in: ['login', 'profile_update', 'password_change'] }
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const formattedAccessLogs = accessLogs.map((log: any) => ({
      id: log._id.toString(),
      userId: log.userId,
      action: log.type.toUpperCase().replace('_', ' '),
      resource: log.metadata?.resource || 'system',
      ipAddress: log.ipAddress,
      timestamp: log.createdAt.toISOString(),
      success: !log.type.includes('failed')
    }))

    return NextResponse.json({
      events,
      activeSessions,
      securityAlerts: securityAlerts.map((alert: any) => ({
        id: (alert._id as any).toString(),
        type: alert.type,
        severity: alert.severity,
        message: alert.description,
        userId: alert.userId,
        ipAddress: alert.ipAddress,
        timestamp: alert.createdAt.toISOString(),
        resolved: alert.resolved
      })),
      systemHealth,
      accessLogs: formattedAccessLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching security data:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch security data' },
      { status: 500 }
    )
  }
}

// POST /api/security - Create security event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = createSecurityEventSchema.parse(body)

    const event = new SecurityEvent({
      type: data.type,
      severity: data.severity,
      userId: data.userId && user.role === 'admin' ? data.userId : user.uid,
      userEmail: data.userEmail || user.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      description: data.description,
      metadata: data.metadata
    })

    await event.save()

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Error creating security event:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create security event' }, { status: 500 })
  }
}