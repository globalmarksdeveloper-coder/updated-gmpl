import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { rows } = await query(`SELECT terms_accepted_at FROM gm_users WHERE user_id = $1`, [user.userId])
    return NextResponse.json({ accepted: !!rows[0]?.terms_accepted_at })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    await query(`UPDATE gm_users SET terms_accepted_at = NOW() WHERE user_id = $1`, [user.userId])
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}