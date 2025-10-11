import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { withApiHandler } from '@/lib/with-api-handler'

const getHandler = async (_request: NextRequest, { params }: { params: { uid: string } }) => {
  try {
    await connectDB()
    const user = await User.findOne({ uid: params.uid })
    if (!user || user.role !== 'partner') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const name = user.publicContact?.name || user.displayName
    const email = user.publicContact?.email || user.email
    const phoneNumber = user.publicContact?.phone || user.phoneNumber
    const visible = user.publicContact?.visible !== false

    if (!visible) {
      return NextResponse.json({ error: 'Not available' }, { status: 404 })
    }

    return NextResponse.json({
      name,
      email,
      phoneNumber,
      businessName: user.businessInfo?.companyName,
      address: user.address,
      createdAt: user.createdAt,
      propertiesCount: user.propertiesCount || 0
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch owner info' }, { status: 500 })
  }
}

export const GET = withApiHandler(getHandler, {
  rateLimit: { windowMs: 60 * 1000, max: 60 }
})
