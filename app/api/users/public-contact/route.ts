import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler } from '@/lib/with-api-handler'

const publicContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Phone is required')
})

const getHandler = async (request: NextRequest) => {
  try {
    const authUser = await requireAuth(request)
    await connectDB()
    const user = await User.findOne({ uid: authUser.uid })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const data = {
      name: user.publicContact?.name || user.displayName || '',
      email: user.publicContact?.email || user.email || '',
      phone: user.publicContact?.phone || user.phoneNumber || '',
      completed: !!user.publicContactCompleted
    }
    return NextResponse.json(data)
  } catch (e: any) {
    if (e?.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 })
  }
}

export const GET = withApiHandler(getHandler, {
  rateLimit: { windowMs: 5 * 60 * 1000, max: 30 }
})

const patchHandler = async (request: NextRequest) => {
  try {
    const authUser = await requireAuth(request)
    await connectDB()
    const body = await request.json()
    const input = publicContactSchema.parse(body)

    const user = await User.findOne({ uid: authUser.uid })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    user.publicContact = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      visible: true
    }
    user.publicContactCompleted = true
    user.updatedAt = new Date()
    await user.save()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 })
  }
}

export const PATCH = withApiHandler(patchHandler, {
  rateLimit: { windowMs: 5 * 60 * 1000, max: 10 },
  audit: { type: 'profile_update', severity: 'low', description: 'Updated public contact info' }
})
