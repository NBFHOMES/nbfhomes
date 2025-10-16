import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const createReviewSchema = z.object({
  hotelId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(1)
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const userId = searchParams.get('userId')
    const ownerId = searchParams.get('ownerId') // For partner dashboard - filter by hotel owner
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let query: any = {}

    if (hotelId) {
      query.hotelId = hotelId
    }

    if (userId) {
      if (user.uid !== userId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      query.userId = userId
    }

    // If ownerId is provided, we need to find reviews for hotels owned by this owner
    if (ownerId) {
      if (user.role !== 'partner' || user.uid !== ownerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const hotels = await import('@/models/Hotel').then(Hotel => Hotel.default.find({ ownerId }).select('_id'))
      const hotelIds = hotels.map(h => h._id.toString())
      query.hotelId = { $in: hotelIds }
    }

    if (status && user.role === 'admin') {
      query.status = status
    }

    const skip = (page - 1) * limit

    const reviews = await Review.find(query)
      .populate('hotelId', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments(query)

    return NextResponse.json({
      reviews,
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
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)
    const review = new Review({ ...validatedData, userId: user.uid })
    await review.save()

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}