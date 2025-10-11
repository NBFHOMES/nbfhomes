import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SystemSettings from '@/models/SystemSettings'
import { requireRole } from '@/lib/auth'
import { withApiHandler } from '@/lib/with-api-handler'

function sanitizeSettings(settings: any) {
  if (!settings) return settings

  const safe = typeof settings.toObject === 'function' ? settings.toObject() : JSON.parse(JSON.stringify(settings))

  if (safe.email) {
    const { smtpPassword, ...restEmail } = safe.email
    safe.email = restEmail
  }

  if (safe.payments) {
    const { stripeSecretKey, paypalClientSecret, ...restPayments } = safe.payments
    safe.payments = restPayments
  }

  return safe
}

// GET /api/settings - Get system settings
const getHandler = async (request: NextRequest) => {
  try {
    await requireRole(request, 'admin')
    await connectDB()

    let settings = await SystemSettings.findOne()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await SystemSettings.create({})
    }

    return NextResponse.json(sanitizeSettings(settings))

  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

export const GET = withApiHandler(getHandler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 10 } // 10 requests per 15 minutes
})

// PUT /api/settings - Update system settings
const putHandler = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, 'admin')
    await connectDB()

    const body = await request.json()
    const { updatedBy, ...settingsData } = body

    // Find existing settings or create new ones
    let settings = await SystemSettings.findOne()

    if (settings) {
      // Update existing settings
      Object.assign(settings, settingsData)
      settings.updatedBy = updatedBy
      settings.updatedAt = new Date()
      await settings.save()
    } else {
      // Create new settings
      settings = await SystemSettings.create({
        ...settingsData,
        updatedBy
      })
    }

    return NextResponse.json(sanitizeSettings(settings))

  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}

export const PUT = withApiHandler(putHandler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  audit: {
    type: 'profile_update',
    severity: 'medium',
    description: 'System settings updated by admin'
  }
})