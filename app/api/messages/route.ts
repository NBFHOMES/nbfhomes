import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createMessageSchema = z.object({
  type: z.enum(['inquiry', 'support', 'booking', 'general']),
  subject: z.string().min(1),
  message: z.string().min(1),
  sender: z.object({
    name: z.string().min(1),
    email: z.string().email()
  }).optional(),
  recipient: z.object({
    userId: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email()
  }),
  hotelId: z.string().optional(),
  bookingId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  isAutomated: z.boolean().optional()
})

const updateMessageSchema = z.object({
  messageId: z.string().min(1),
  status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  addReply: z.object({
    message: z.string().min(1)
  }).optional()
}).refine((data) => data.status || data.priority || data.category || data.tags || data.addReply, {
  message: 'At least one field must be provided to update'
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // For filtering messages for a specific user
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const query: any = {}

    if (type) query.type = type
    if (status) query.status = status
    if (priority) query.priority = priority

    if (userId) {
      if (user.role !== 'admin' && user.uid !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      query.$or = [
        { 'sender.userId': userId },
        { 'recipient.userId': userId }
      ]
    } else if (user.role !== 'admin') {
      query.$or = [
        { 'sender.userId': user.uid },
        { 'recipient.userId': user.uid }
      ]
    }

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(query)
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = createMessageSchema.parse(body)

    const senderName = data.sender?.name || user.email || 'User'
    const senderEmail = data.sender?.email || user.email || ''

    const message = new Message({
      type: data.type,
      subject: data.subject,
      message: data.message,
      sender: {
        userId: user.uid,
        name: senderName,
        email: senderEmail
      },
      recipient: data.recipient,
      hotelId: data.hotelId,
      bookingId: data.bookingId,
      status: data.status || 'unread',
      priority: data.priority || 'medium',
      category: data.category,
      tags: data.tags,
      isAutomated: data.isAutomated || false
    })
    await message.save()

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = updateMessageSchema.parse(body)

    const message = await Message.findById(data.messageId)

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const isParticipant = message.sender.userId === user.uid || message.recipient.userId === user.uid
    if (!isParticipant && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (data.status) {
      message.status = data.status
    }

    if (data.priority) {
      message.priority = data.priority
    }

    if (data.category) {
      message.category = data.category
    }

    if (data.tags) {
      message.tags = data.tags
    }

    if (data.addReply) {
      message.replies.push({
        message: data.addReply.message,
        sender: user.email || user.uid,
        senderId: user.uid,
        createdAt: new Date()
      })
    }

    message.updatedAt = new Date()
    await message.save()

    return NextResponse.json({ message })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}