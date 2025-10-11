import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PartnerApplication from '@/models/PartnerApplication'
import User from '@/models/User'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  status: z.enum(['pending_review', 'under_review', 'approved', 'rejected', 'on_hold']),
  reviewNotes: z.string().optional()
})

// GET /api/partner-applications/[id] - Get specific partner application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const application = await PartnerApplication.findById(params.id).lean()

    if (!application) {
      return NextResponse.json(
        { error: 'Partner application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)

  } catch (error) {
    console.error('Error fetching partner application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner application' },
      { status: 500 }
    )
  }
}

// PUT /api/partner-applications/[id] - Update partner application (approve/reject/hold)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const { status, reviewNotes } = updateApplicationSchema.parse(body)

    const application = await PartnerApplication.findById(params.id)

    if (!application) {
      return NextResponse.json(
        { error: 'Partner application not found' },
        { status: 404 }
      )
    }

    // Update application status
    application.status = status
    application.reviewNotes = reviewNotes
    application.reviewedBy = adminUser.uid
    application.reviewedAt = new Date()

    // If approved, update user role to partner
    if (status === 'approved') {
      const user = await User.findOne({ email: application.email })
      if (user) {
        user.role = 'partner'
        user.status = 'active'
        await user.save()
      } else {
        // Create user record if it doesn't exist
        const newUser = new User({
          uid: `partner-${Date.now()}`, // Temporary UID, should be updated when user logs in
          displayName: `${application.firstName} ${application.lastName}`,
          email: application.email,
          role: 'partner',
          status: 'active'
        })
        await newUser.save()
      }
    }

    await application.save()

    return NextResponse.json(application)

  } catch (error) {
    console.error('Error updating partner application:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update partner application' }, { status: 500 })
  }
}

// DELETE /api/partner-applications/[id] - Delete partner application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const application = await PartnerApplication.findByIdAndDelete(params.id)

    if (!application) {
      return NextResponse.json(
        { error: 'Partner application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Partner application deleted successfully' })

  } catch (error) {
    console.error('Error deleting partner application:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete partner application' }, { status: 500 })
  }
}