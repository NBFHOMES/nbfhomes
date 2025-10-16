import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SupportTicket from '@/models/SupportTicket'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  addMessage: z.object({
    message: z.string().min(1),
    isInternal: z.boolean().optional()
  }).optional(),
  resolution: z.object({
    resolved: z.boolean(),
    resolution: z.string().min(1).optional()
  }).optional()
}).refine((data) => data.status || data.priority || data.assignedTo || data.tags || data.addMessage || data.resolution, {
  message: 'At least one update field must be provided'
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const ticket = await SupportTicket.findById(params.id)

    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 })
    }

    if (ticket.userId !== user.uid && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch support ticket' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectDB()

    const body = await request.json()
    const data = updateTicketSchema.parse(body)

    const ticket = await SupportTicket.findById(params.id)

    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 })
    }

    if (data.status) {
      ticket.status = data.status
    }

    if (data.priority) {
      ticket.priority = data.priority
    }

    if (data.assignedTo !== undefined) {
      ticket.assignedTo = data.assignedTo
    }

    if (data.tags) {
      ticket.tags = data.tags
    }

    if (data.addMessage) {
      ticket.messages.push({
        senderId: user.uid,
        senderName: user.email || 'Admin',
        senderType: 'admin',
        message: data.addMessage.message,
        isInternal: data.addMessage.isInternal ?? false
      })
    }

    if (data.resolution) {
      if (data.resolution.resolved) {
        ticket.status = 'resolved'
        ticket.resolution = {
          resolvedBy: user.uid,
          resolution: data.resolution.resolution,
          resolvedAt: new Date()
        }
      } else {
        ticket.resolution = undefined
        if (ticket.status === 'resolved') {
          ticket.status = 'open'
        }
      }
    }

    ticket.updatedAt = new Date()
    ticket.lastActivity = new Date()
    await ticket.save()

    return NextResponse.json({ ticket })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectDB()

    const ticket = await SupportTicket.findByIdAndDelete(params.id)

    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Support ticket deleted successfully' })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete support ticket' }, { status: 500 })
  }
}