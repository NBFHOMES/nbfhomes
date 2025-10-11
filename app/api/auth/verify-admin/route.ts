import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin')
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
