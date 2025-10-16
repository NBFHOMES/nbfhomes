import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SystemAlert from '@/models/SystemAlert'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateAlertSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  acknowledged: z.boolean().optional(),
  resolved: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
}).refine(data => data.title || data.message || data.severity || data.acknowledged !== undefined || data.resolved !== undefined || data.metadata, {
  message: 'At least one field must be provided to update'
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const alert = await SystemAlert.findById(params.id)

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({ alert })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const data = updateAlertSchema.parse(body)

    const alert = await SystemAlert.findById(params.id)

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    if (data.title) alert.title = data.title
    if (data.message) alert.message = data.message
    if (data.severity) alert.severity = data.severity
    if (data.metadata) alert.metadata = data.metadata

    if (data.acknowledged !== undefined) {
      alert.acknowledged = data.acknowledged
      if (data.acknowledged) {
        alert.acknowledgedBy = user.uid
        alert.acknowledgedAt = new Date()
      } else {
        alert.acknowledgedBy = undefined
        alert.acknowledgedAt = undefined
      }
    }

    if (data.resolved !== undefined) {
      alert.resolved = data.resolved
      if (data.resolved) {
        alert.resolvedBy = user.uid
        alert.resolvedAt = new Date()
      } else {
        alert.resolvedBy = undefined
        alert.resolvedAt = undefined
      }
    }

    alert.updatedAt = new Date()
    await alert.save()

    return NextResponse.json({ alert })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const alert = await SystemAlert.findByIdAndDelete(params.id)

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Alert deleted successfully' })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}