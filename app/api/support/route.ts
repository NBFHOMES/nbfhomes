import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SupportTicket from '@/models/SupportTicket'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['booking', 'payment', 'account', 'hotel', 'technical', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  attachments: z.array(z.object({
    filename: z.string().min(1),
    url: z.string().url()
  })).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    bookingId: z.string().optional(),
    hotelId: z.string().optional()
  }).optional()
})

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assignedTo = searchParams.get('assignedTo')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let query: any = {}

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (category) {
      query.category = category
    }

    if (assignedTo) {
      query.assignedTo = assignedTo
    }

    const skip = (page - 1) * limit

    const tickets = await SupportTicket.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)

    const total = await SupportTicket.countDocuments(query)

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = createTicketSchema.parse(body)

    const ticketId = `TICK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const ticket = new SupportTicket({
      ticketId,
      userId: user.uid,
      userEmail: user.email || 'unknown@user.com',
      userName: user.email || 'User',
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      attachments: data.attachments,
      metadata: data.metadata,
      lastActivity: new Date()
    })

    await ticket.save()

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 })
  }
}