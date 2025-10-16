import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PartnerApplication from '@/models/PartnerApplication'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const createApplicationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  documents: z.object({
    selfie: z.string().url(),
    aadharFront: z.string().url(),
    aadharBack: z.string().url()
  }),
  agreements: z.object({
    terms: z.boolean(),
    privacy: z.boolean(),
    verification: z.boolean()
  })
})

// GET /api/partner-applications - Get all partner applications
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    let query: any = {}
    if (status) {
      query.status = status
    }

    const applications = await PartnerApplication.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await PartnerApplication.countDocuments(query)

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching partner applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner applications' },
      { status: 500 }
    )
  }
}

// POST /api/partner-applications - Create new partner application
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const data = createApplicationSchema.parse(body)

    // Check if user already has a pending application
    const existingApplication = await PartnerApplication.findOne({
      email: data.email,
      status: { $in: ['pending_review', 'under_review'] }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending partner application' },
        { status: 400 }
      )
    }

    const application = new PartnerApplication({
      userId: user.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      documents: data.documents,
      agreements: data.agreements,
      status: 'pending_review'
    })

    await application.save()

    return NextResponse.json(application, { status: 201 })

  } catch (error) {
    console.error('Error creating partner application:', error)
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create partner application' }, { status: 500 })
  }
}