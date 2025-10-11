import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateUserSchema = z.object({
  displayName: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  role: z.enum(['guest', 'partner', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  businessInfo: z.object({
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    businessLicense: z.string().optional()
  }).optional(),
  bookingsCount: z.number().int().min(0).optional(),
  propertiesCount: z.number().int().min(0).optional(),
  totalSpent: z.number().min(0).optional(),
  totalRevenue: z.number().min(0).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(request)
    const isAdmin = authUser.role === 'admin'
    await connectDB()

    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!isAdmin && user.uid !== authUser.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const data = updateUserSchema.parse(body)

    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    Object.assign(user, data)
    user.updatedAt = new Date()
    await user.save()

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}