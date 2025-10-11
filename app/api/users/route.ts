import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler } from '@/lib/with-api-handler'

const createUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.string().optional().default('guest')
})

const getHandler = async (request: NextRequest) => {
  try {
    await connectDB()
    const sanitize = (u: any) => {
      if (!u) return u
      const obj = typeof u.toObject === 'function' ? u.toObject() : u
      const {
        _id, uid, displayName, email, photoURL, role, status,
        bookingsCount, propertiesCount, totalSpent, totalRevenue,
        lastLogin, createdAt, updatedAt
      } = obj
      return { _id, uid, displayName, email, photoURL, role, status, bookingsCount, propertiesCount, totalSpent, totalRevenue, lastLogin, createdAt, updatedAt }
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const firebaseId = searchParams.get('firebaseId')
    const email = searchParams.get('email')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let query: any = {}

    if (role) {
      query.role = role
    }

    if (status) {
      query.status = status
    }

    if (firebaseId) {
      query.uid = firebaseId
    }

    if (email) {
      query.email = email
    }

    if (firebaseId || email) {
      const authUser = await requireAuth(request)
      const isAdmin = authUser.role === 'admin'
      const matchesFirebase = firebaseId && authUser.uid === firebaseId
      const matchesEmail = email && authUser.email === email

      if (!isAdmin && !matchesFirebase && !matchesEmail) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // If firebaseId or email is provided, return single user
      const user = await User.findOne(query)
      return NextResponse.json(sanitize(user))
    } else {
      await requireRole(request, 'admin')
      // Otherwise return array of users with pagination
      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
      ])
      return NextResponse.json({
        users: users.map(sanitize),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export const GET = withApiHandler(getHandler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 20 } // 20 requests per 15 minutes
})

const postHandler = async (request: NextRequest) => {
  try {
    await connectDB()

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    // Prevent setting role to admin
    if (validatedData.role === 'admin') {
      validatedData.role = 'guest'
    }

    // Check if user already exists by uid or email
    const existingUser = await User.findOne({
      $or: [
        { uid: validatedData.uid },
        { email: validatedData.email }
      ]
    })

    if (existingUser) {
      // Update existing user with new data, but preserve role
      const { role, ...updateData } = validatedData
      Object.assign(existingUser, updateData)
      existingUser.lastLogin = new Date()
      await existingUser.save()
      return NextResponse.json({ user: existingUser }, { status: 200 })
    }

    const user = new User(validatedData)
    await user.save()

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export const POST = withApiHandler(postHandler, {
  rateLimit: { windowMs: 60 * 60 * 1000, max: 10 }, // 10 requests per hour
  audit: {
    type: 'profile_update',
    severity: 'low',
    description: 'New user created'
  }
})