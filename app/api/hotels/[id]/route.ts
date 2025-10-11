import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Hotel from '@/models/Hotel'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const coordinatesSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional()
})

const locationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  coordinates: coordinatesSchema.optional()
})

const roomSchema = z.object({
  type: z.string().optional(),
  price: z.number().min(0).optional(),
  available: z.number().int().min(0).optional()
})

const updateHotelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: locationSchema.optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional()
  })).optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  pricePerNight: z.number().min(0).optional(),
  rooms: z.array(roomSchema).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = updateHotelSchema.parse(body)

    const hotel = await Hotel.findById(params.id)

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    const isOwner = hotel.ownerId === user.uid
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if ((data.status !== undefined || data.isActive !== undefined) && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to modify moderation fields' }, { status: 403 })
    }

    Object.assign(hotel, data)
    hotel.updatedAt = new Date()
    await hotel.save()
    
    return NextResponse.json({ hotel })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const hotel = await Hotel.findById(params.id)
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    const obj = hotel.toObject()
    return NextResponse.json({ hotel: obj })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 })
  }
}
