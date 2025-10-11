import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SystemAlert from '@/models/SystemAlert'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const createAlertSchema = z.object({
  type: z.enum(['system', 'security', 'performance', 'business', 'user']),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string().min(1),
  message: z.string().min(1),
  source: z.string().min(1),
  metadata: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const acknowledged = searchParams.get('acknowledged')
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let query: any = {}

    if (type) {
      query.type = type
    }

    if (severity) {
      query.severity = severity
    }

    if (acknowledged !== null) {
      query.acknowledged = acknowledged === 'true'
    }

    if (resolved !== null) {
      query.resolved = resolved === 'true'
    }

    const skip = (page - 1) * limit

    const alerts = await SystemAlert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await SystemAlert.countDocuments(query)

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const data = createAlertSchema.parse(body)
    const alert = new SystemAlert(data)
    await alert.save()

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}