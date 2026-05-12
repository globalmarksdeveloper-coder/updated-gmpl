import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/**
 * POST /api/auth/auto-absent
 *
 * Marks Absent for all BAs/TSCs/AMs who:
 *   1. Have an active store assignment today
 *   2. Have NO attendance record for today
 *   3. Their shift end time has already passed (Pakistan time UTC+5)
 *
 * Call this from:
 *   - Admin dashboard on load (fire-and-forget)
 *   - A cron job / scheduler (e.g. Vercel Cron, GitHub Actions)
 *   - Any automated background task
 */
export async function POST(request: NextRequest) {
  // Allow both admin and unauthenticated cron calls
  // (cron calls use a secret header for security)
  const user = getUserFromRequest(request)
  const cronSecret = request.headers.get('x-cron-secret')
  const validCron = cronSecret === (process.env.CRON_SECRET || 'gmpl-cron-2024')

  if (!user && !validCron) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Pakistan time = UTC+5
    const now    = new Date()
    const pkNow  = new Date(now.getTime() + 5 * 60 * 60 * 1000)
    const pkHour = pkNow.getUTCHours()
    const pkMin  = pkNow.getUTCMinutes()
    const nowMins = pkHour * 60 + pkMin

    // Find all employees with active assignments whose shift has ended
    // and who have no attendance record for today
    const { rows: missing } = await query(`
      SELECT
        esa.assignment_id,
        esa.employee_id,
        esa.store_id,
        esa.shift_id,
        sh.end_time,
        u.full_name,
        r.role_name
      FROM employee_store_assignments esa
      JOIN gm_employees e  ON esa.employee_id = e.employee_id
      JOIN gm_users u      ON e.user_id = u.user_id
      JOIN roles r         ON e.role_id = r.role_id
      JOIN shifts sh       ON esa.shift_id = sh.shift_id
      WHERE esa.is_active = TRUE
        AND LOWER(r.role_name) IN ('brand ambassador', 'tsc', 'area manager')
        AND NOT EXISTS (
          SELECT 1 FROM attendance a
          WHERE a.employee_id = esa.employee_id
            AND a.attendance_date = $1
        )
    `, [today])

    let marked = 0
    const skipped: string[] = []

    for (const emp of missing) {
      // Check if shift end time has passed
      const endTime = emp.end_time as string  // e.g. "17:00:00"
      const [endHour, endMin] = endTime.split(':').map(Number)
      const endMins = endHour * 60 + endMin

      if (nowMins <= endMins) {
        // Shift not over yet — skip
        skipped.push(`${emp.full_name} (shift ends ${endTime})`)
        continue
      }

      // Insert Absent record
      try {
// Pehle check karo — agar already exists to skip
        const { rows: existing } = await query(
          `SELECT 1 FROM attendance WHERE employee_id = $1 AND attendance_date = $2`,
          [emp.employee_id, today]
        )
        if (existing.length === 0) {
          await query(`
            INSERT INTO attendance
              (assignment_id, employee_id, store_id, shift_id, attendance_date, status)
            VALUES ($1, $2, $3, $4, $5, 'Absent')
          `, [emp.assignment_id, emp.employee_id, emp.store_id, emp.shift_id, today])
          marked++
        }

      } catch (_e: unknown) {
        // Skip conflicts silently
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      marked,
      skipped_count: skipped.length,
      message: `Marked ${marked} employee(s) Absent. ${skipped.length} skipped (shift not over yet).`,
    })

  } catch (err: unknown) {
    console.error('auto-absent error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// Also allow GET for easy testing in browser
export async function GET(request: NextRequest) {
  return POST(request)
}