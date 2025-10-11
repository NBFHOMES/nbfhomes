import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireRole } from '@/lib/auth'
import { withApiHandler } from '@/lib/with-api-handler'

// POST /api/users/[id]/promote - Promote user to admin
async function postHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const user = await User.findByIdAndUpdate(
      params.id,
      { role: 'admin', status: 'active', updatedAt: new Date() },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'User promoted to admin successfully',
      user: { id: user._id, email: user.email, role: user.role, status: user.status }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 })
  }
}

export const POST = withApiHandler(postHandler, {
  rateLimit: { windowMs: 60 * 60 * 1000, max: 5 },
  audit: {
    type: 'suspicious_activity',
    severity: 'high',
    description: 'User role promotion attempted'
  }
})