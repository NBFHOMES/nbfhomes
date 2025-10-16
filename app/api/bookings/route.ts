import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler } from '@/lib/with-api-handler'

const createBookingSchema = z.object({
  hotelId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().min(1),
  totalPrice: z.number().min(0)
})

const getHandler = async (request: NextRequest) => {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const ownerId = searchParams.get('ownerId') // For partner dashboard - filter by hotel owner
    const hotelId = searchParams.get('hotelId') // For specific hotel bookings
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let query: any = {}

    // Always require authentication
    const user = await requireAuth(request)

    // Check permissions
    if (userId) {
      if (user.uid !== userId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      query.userId = userId
    } else if (ownerId) {
      // Only allow a partner to access their own hotels' bookings
      if (user.role !== 'admin' && !(user.role === 'partner' && user.uid === ownerId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Find bookings for hotels owned by this partner
      const hotels = await import('@/models/Hotel').then(Hotel => Hotel.default.find({ ownerId }).select('_id'))
      const hotelIds = hotels.map(h => h._id.toString())
      query.hotelId = { $in: hotelIds }
    } else if (user.role !== 'admin') {
      // If no specific filter and not admin, only show user's own bookings
      query.userId = user.uid
    }

    if (hotelId) {
      query.hotelId = hotelId
    }

    // Date range filtering
    if (startDate || endDate) {
      query.checkIn = {}
      if (startDate) query.checkIn.$gte = new Date(startDate)
      if (endDate) query.checkIn.$lte = new Date(endDate)
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('hotelId', 'name location.city images') // Only populate essential fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ])

    return NextResponse.json({
      bookings,
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
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export const GET = withApiHandler(getHandler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 30 } // 30 requests per 15 minutes
})

const postHandler = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)
    const booking = new Booking({ ...validatedData, userId: user.uid })
    await booking.save()

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export const POST = withApiHandler(postHandler, {
  rateLimit: { windowMs: 60 * 60 * 1000, max: 20 }, // 20 bookings per hour
  audit: {
    type: 'profile_update',
    severity: 'low',
    description: 'New booking created'
  }
})
