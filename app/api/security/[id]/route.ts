import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SecurityEvent from '@/models/SecurityEvent'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateSecurityEventSchema = z.object({
  resolved: z.boolean(),
  resolutionNotes: z.string().min(1).optional()
})

// GET /api/security/[id] - Get specific security event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const event = await SecurityEvent.findById(params.id).lean()

    if (!event) {
      return NextResponse.json(
        { error: 'Security event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)

  } catch (error) {
    console.error('Error fetching security event:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch security event' }, { status: 500 })
  }
}

// PUT /api/security/[id] - Update security event (e.g., resolve alert)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const data = updateSecurityEventSchema.parse(body)

    const event = await SecurityEvent.findById(params.id)

    if (!event) {
      return NextResponse.json(
        { error: 'Security event not found' },
        { status: 404 }
      )
    }

    event.resolved = data.resolved
    if (data.resolved) {
      event.resolvedBy = user.uid
      event.resolvedAt = new Date()
      if (data.resolutionNotes) {
        event.metadata = {
          ...event.metadata,
          resolutionNotes: data.resolutionNotes
        }
      }
    } else {
      event.resolvedBy = undefined
      event.resolvedAt = undefined
      if (event.metadata) {
        const { resolutionNotes, ...rest } = event.metadata as Record<string, unknown>
        event.metadata = rest
      }
    }

    await event.save()

    return NextResponse.json(event.toObject())

  } catch (error) {
    console.error('Error updating security event:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update security event' }, { status: 500 })
  }
}

// DELETE /api/security/[id] - Delete security event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const event = await SecurityEvent.findByIdAndDelete(params.id)

    if (!event) {
      return NextResponse.json(
        { error: 'Security event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Security event deleted successfully' })

  } catch (error) {
    console.error('Error deleting security event:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete security event' }, { status: 500 })
  }
}