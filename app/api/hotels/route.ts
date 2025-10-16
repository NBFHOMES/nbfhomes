import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Hotel from '@/models/Hotel'
import { requireRole, requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createHotelSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1)
  }),
  images: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().optional()
  })).min(1),
  amenities: z.array(z.string().min(1)),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().min(0).optional().default(0),
  pricePerNight: z.number().min(0),
  rooms: z.array(z.object({
    type: z.string().min(1),
    price: z.number().min(0),
    available: z.number().min(0).optional().default(0)
  })).min(1)
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const includeInactive = searchParams.get('includeInactive') === 'true' // For admin panel
    const ownerId = searchParams.get('ownerId') // For partner dashboard
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Check auth for privileged queries
    if (includeInactive && !ownerId) {
      await requireRole(request, 'admin')
    }
    if (ownerId) {
      const authUser = await requireAuth(request)
      const isAllowed = authUser.role === 'admin' || (authUser.role === 'partner' && authUser.uid === ownerId)
      if (!isAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query: any = includeInactive ? {} : { isActive: true }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' }
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {}
      if (minPrice) query.pricePerNight.$gte = parseInt(minPrice)
      if (maxPrice) query.pricePerNight.$lte = parseInt(maxPrice)
    }

    if (ownerId) {
      query.ownerId = ownerId
    }

    const [hotels, total] = await Promise.all([
      Hotel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Hotel.countDocuments(query)
    ])

    const serializedHotels = hotels.map((h: any) =>
      typeof h.toObject === 'function' ? h.toObject() : h
    )

    return NextResponse.json({
      hotels: serializedHotels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'partner')
    await connectDB()

    const body = await request.json()
    const validatedData = createHotelSchema.parse(body)
    const hotel = new Hotel({ ...validatedData, ownerId: user.uid })
    await hotel.save()

    return NextResponse.json({ hotel }, { status: 201 })
  } catch (error) {
    console.error('Error creating hotel:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 })
  }
}
