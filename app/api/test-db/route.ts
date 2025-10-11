import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Hotel from '@/models/Hotel'
import Booking from '@/models/Booking'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const hotelsCount = await Hotel.countDocuments()
    const bookingsCount = await Booking.countDocuments()

    return NextResponse.json({
      success: true,
      data: {
        hotelsCount,
        bookingsCount,
        message: 'Database connection successful'
      }
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
