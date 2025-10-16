import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler } from '@/lib/with-api-handler'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  comment: z.string().min(1).optional(),
  rating: z.number().min(1).max(5).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
}).refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })

async function getHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const review = await Review.findById(params.id).populate('hotelId', 'name location')
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    // Only author or admin can view non-approved reviews
    if (review.status !== 'approved' && user.role !== 'admin' && review.userId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ review })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

async function patchHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = updateSchema.parse(body)
    const review = await Review.findById(params.id)
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    const isAuthor = review.userId === user.uid
    const isAdmin = user.role === 'admin'
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Only admin can change moderation status
    if ('status' in data && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    Object.assign(review, { ...data, updatedAt: new Date() })
    await review.save()
    const populated = await Review.findById(params.id).populate('hotelId', 'name location')
    return NextResponse.json({ review: populated })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

async function deleteHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    const review = await Review.findById(params.id)
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    const isAuthor = review.userId === user.uid
    const isAdmin = user.role === 'admin'
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await Review.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}

export const GET = withApiHandler(getHandler, { rateLimit: { windowMs: 15 * 60 * 1000, max: 60 } })
export const PATCH = withApiHandler(patchHandler, { rateLimit: { windowMs: 15 * 60 * 1000, max: 20 } })
export const DELETE = withApiHandler(deleteHandler, { rateLimit: { windowMs: 60 * 60 * 1000, max: 10 } })