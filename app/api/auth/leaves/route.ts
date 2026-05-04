import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const isAdmin = user.role === 'admin'
    const { rows } = await query(`
      SELECT l.*, u.full_name, u.email, r.role_name,
        e.employee_code,
        -- Count approved leaves this year
        (SELECT COUNT(*) FROM leaves l2
         WHERE l2.employee_id = l.employee_id
         AND l2.status = 'approved'
         AND EXTRACT(YEAR FROM l2.from_date) = EXTRACT(YEAR FROM CURRENT_DATE)) AS leaves_taken_this_year
      FROM leaves l
      JOIN gm_employees e ON l.employee_id = e.employee_id
      JOIN gm_users u ON e.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      ${isAdmin ? '' : 'WHERE e.user_id = $1'}
      ORDER BY l.created_at DESC
      LIMIT 100
    `, isAdmin ? [] : [user.userId])
    return NextResponse.json({ leaves: rows })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'apply_leave') {
      const { from_date, to_date, leave_type, reason } = body
      if (!from_date || !to_date || !leave_type) return NextResponse.json({ message: 'From date, to date and leave type are required' }, { status: 400 })
      if (new Date(from_date) > new Date(to_date)) return NextResponse.json({ message: 'From date cannot be after to date' }, { status: 400 })
      // Get employee_id
      const { rows: emp } = await query(`SELECT employee_id FROM gm_employees WHERE user_id = $1`, [user.userId])
      if (!emp.length) return NextResponse.json({ message: 'Employee record not found' }, { status: 404 })
      const employee_id = emp[0].employee_id
      // Check for overlapping leave
      const { rows: overlap } = await query(`
        SELECT leave_id FROM leaves
        WHERE employee_id = $1 AND status != 'rejected'
        AND (from_date, to_date) OVERLAPS ($2::date, $3::date)
      `, [employee_id, from_date, to_date])
      if (overlap.length) return NextResponse.json({ message: 'You already have a leave request for these dates' }, { status: 409 })
      // Count days (excluding Sundays)
      const days = countWorkingDays(from_date, to_date)
      await query(`
        INSERT INTO leaves (employee_id, from_date, to_date, leave_type, reason, days_count, status)
        VALUES ($1,$2,$3,$4,$5,$6,'pending')
      `, [employee_id, from_date, to_date, leave_type, reason || null, days])
      return NextResponse.json({ success: true, message: `Leave applied for ${days} day(s)` })
    }

    if (action === 'approve_leave' || action === 'reject_leave') {
      if (user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      const status = action === 'approve_leave' ? 'approved' : 'rejected'
      await query(`UPDATE leaves SET status=$1, admin_note=$2, reviewed_at=NOW() WHERE leave_id=$3`,
        [status, body.admin_note || null, body.leave_id])
      return NextResponse.json({ success: true, message: `Leave ${status}` })
    }

    if (action === 'cancel_leave') {
      const { rows: lv } = await query(`SELECT l.employee_id FROM leaves l JOIN gm_employees e ON l.employee_id = e.employee_id WHERE l.leave_id = $1 AND e.user_id = $2`, [body.leave_id, user.userId])
      if (!lv.length && user.role !== 'admin') return NextResponse.json({ message: 'Not allowed' }, { status: 403 })
      await query(`UPDATE leaves SET status='cancelled' WHERE leave_id=$1 AND status='pending'`, [body.leave_id])
      return NextResponse.json({ success: true, message: 'Leave cancelled' })
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

function countWorkingDays(from: string, to: string): number {
  let count = 0
  const cur = new Date(from)
  const end = new Date(to)
  while (cur <= end) {
    if (cur.getDay() !== 0) count++ // exclude Sundays
    cur.setDate(cur.getDate() + 1)
  }
  return count
}
