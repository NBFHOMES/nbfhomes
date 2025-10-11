import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PartnerSettings from '@/models/PartnerSettings'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  taxId: z.string().optional()
})

const notificationsSchema = z.object({
  emailBookings: z.boolean().optional(),
  emailReviews: z.boolean().optional(),
  emailMessages: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  pushBookings: z.boolean().optional(),
  pushReviews: z.boolean().optional()
})

const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().int().min(5).max(480).optional()
})

const paymentSchema = z.object({
  payoutMethod: z.enum(['bank', 'paypal', 'stripe']).optional(),
  payoutSchedule: z.enum(['weekly', 'monthly', 'manual']).optional(),
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountName: z.string().optional()
  }).optional()
})

const upsertSchema = z.object({
  userId: z.string().min(1),
  profile: profileSchema.optional(),
  notifications: notificationsSchema.optional(),
  security: securitySchema.optional(),
  payment: paymentSchema.optional()
}).refine(data => data.profile || data.notifications || data.security || data.payment, {
  message: 'At least one settings section must be provided'
})

const updateSchema = z.object({
  userId: z.string().min(1),
  profile: profileSchema.optional(),
  notifications: notificationsSchema.optional(),
  security: securitySchema.optional(),
  payment: paymentSchema.optional()
}).refine(data => data.profile || data.notifications || data.security || data.payment, {
  message: 'At least one settings section must be provided'
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (user.uid !== userId) {
      await requireRole(request, 'admin')
    }

    let settings = await PartnerSettings.findOne({ userId })

    // If no settings exist, create default settings
    if (!settings) {
      settings = new PartnerSettings({ userId })
      await settings.save()
    }

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch partner settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const { userId, ...settingsData } = upsertSchema.parse(body)

    if (user.uid !== userId) {
      await requireRole(request, 'admin')
    }

    const settings = await PartnerSettings.findOneAndUpdate(
      { userId },
      { ...settingsData, updatedAt: new Date() },
      { new: true, upsert: true }
    )

    return NextResponse.json({ settings }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save partner settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    await connectDB()

    const body = await request.json()
    const { userId, ...updateData } = updateSchema.parse(body)

    if (user.uid !== userId) {
      await requireRole(request, 'admin')
    }

    const settings = await PartnerSettings.findOneAndUpdate(
      { userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update partner settings' }, { status: 500 })
  }
}