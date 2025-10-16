import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const body = await request.json()
    const { status } = updateBookingSchema.parse(body)
    
    const booking = await Booking.findById(params.id).populate('hotelId', 'ownerId')
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const hotel = booking.hotelId as any
    const isAdmin = user.role === 'admin'
    const isOwner = hotel?.ownerId === user.uid
    const isGuest = booking.userId === user.uid

    if (!isAdmin && !isOwner) {
      const guestCancelling = isGuest && status === 'cancelled'
      if (!guestCancelling) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    booking.status = status
    booking.updatedAt = new Date()
    await booking.save()
    
    return NextResponse.json({ booking })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
