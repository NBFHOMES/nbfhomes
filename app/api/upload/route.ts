import { NextRequest, NextResponse } from 'next/server'
import imagekit from '@/lib/imagekit'
import { requireAuth } from '@/lib/auth'
import { withApiHandler } from '@/lib/with-api-handler'

async function postHandler(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Basic validations
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate safe filename
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const safeName = `u_${user.uid}_${Date.now()}.${ext}`

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: safeName,
      folder: '/hotels'
    })

    return NextResponse.json({ url: uploadResponse.url, fileId: uploadResponse.fileId })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

async function getHandler(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!(user.role === 'admin' || user.role === 'partner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const authenticationParameters = imagekit.getAuthenticationParameters()
    return NextResponse.json(authenticationParameters)
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}

export const POST = withApiHandler(postHandler, { rateLimit: { windowMs: 15 * 60 * 1000, max: 20 } })
export const GET = withApiHandler(getHandler, { rateLimit: { windowMs: 15 * 60 * 1000, max: 30 } })
