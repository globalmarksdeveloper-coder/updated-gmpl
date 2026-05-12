import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// Haversine formula — returns distance in meters between two GPS points
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const GEOFENCE_RADIUS_METERS = 200

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const today      = new Date().toISOString().split('T')[0]
    const employeeId = user.employeeId

    if (!employeeId) return NextResponse.json({ attendance: null, assignment: null })

    const { rows: attRows } = await query(`
      SELECT a.*, s.store_name, sh.shift_name
      FROM attendance a
      JOIN stores s  ON a.store_id  = s.store_id
      JOIN shifts sh ON a.shift_id  = sh.shift_id
      WHERE a.employee_id = $1 AND a.attendance_date = $2
    `, [employeeId, today])

    const { rows: assignRows } = await query(`
      SELECT a.*, s.store_name, sh.shift_name, s.latitude AS store_lat, s.longitude AS store_lng, s.address
      FROM employee_store_assignments a
      JOIN stores s  ON a.store_id  = s.store_id
      JOIN shifts sh ON a.shift_id  = sh.shift_id
      WHERE a.employee_id = $1 AND a.is_active = TRUE
      LIMIT 1
    `, [employeeId])

    const att    = attRows[0]    || null
    const assign = assignRows[0] || null
// ── Auto-mark Absent if shift has ended and no attendance record ──
    if (!att && assign) {
      try {
        const { rows: shiftRows } = await query(
          `SELECT end_time FROM shifts WHERE shift_id = $1`,
          [assign.shift_id]
        )
        if (shiftRows.length > 0) {
          const shiftEnd = shiftRows[0].end_time as string
          const [endHour, endMin] = shiftEnd.split(':').map(Number)
          const now   = new Date()
          const pkNow = new Date(now.getTime() + 5 * 60 * 60 * 1000)
          const nowMins = pkNow.getUTCHours() * 60 + pkNow.getUTCMinutes()
          const endMins = endHour * 60 + endMin

          if (nowMins > endMins) {
            await query(`
              INSERT INTO attendance
                (assignment_id, employee_id, store_id, shift_id, attendance_date, status)
              VALUES ($1, $2, $3, $4, $5, 'Absent')
              ON CONFLICT DO NOTHING
            `, [assign.assignment_id, employeeId, assign.store_id, assign.shift_id, today])
          }
        }
      } catch (_e: unknown) { /* silent */ }
    }
    // ─────────────────────────────────────────────────────────────────
    
    const storeLat = assign?.store_lat ? parseFloat(assign.store_lat) : null
    const storeLng = assign?.store_lng ? parseFloat(assign.store_lng) : null
    const storeAddress = assign?.address || null

    if (!att) return NextResponse.json({
      attendance: null,
      assignment: assign,
      storeLat: storeLat && !isNaN(storeLat) ? storeLat : null,
      storeLng: storeLng && !isNaN(storeLng) ? storeLng : null,
      storeAddress,
    })

    return NextResponse.json({
      attendance: {
        attendance_id: att.attendance_id,
        check_in:      att.check_in_time,
        check_out:     att.check_out_time,
        break_start:   att.break_start_time || null,
        break_end:     att.break_end_time   || null,
        status:        att.status,
        store_name:    att.store_name,
        shift_name:    att.shift_name,
      },
      assignment: assign,
      storeLat: storeLat && !isNaN(storeLat) ? storeLat : null,
      storeLng: storeLng && !isNaN(storeLng) ? storeLng : null,
      storeAddress,
    })
  } catch (err: unknown) {
    console.error('Attendance GET error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { action, latitude, longitude } = await request.json()
    const today      = new Date().toISOString().split('T')[0]
    const employeeId = user.employeeId

    if (!employeeId) return NextResponse.json({ message: 'No employee record found' }, { status: 400 })

    const { rows: assignRows } = await query(
      `SELECT esa.*, s.latitude AS store_lat, s.longitude AS store_lng
       FROM employee_store_assignments esa
       JOIN stores s ON esa.store_id = s.store_id
       WHERE esa.employee_id = $1 AND esa.is_active = TRUE LIMIT 1`,
      [employeeId]
    )
    const assign = assignRows[0]
    if (!assign) return NextResponse.json({ message: 'No active store assignment found' }, { status: 400 })

    const { rows: existing } = await query(
      `SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2`,
      [employeeId, today]
    )
    const att = existing[0] || null
    
    

    if (action === 'checkin') {
      if (att) return NextResponse.json({ message: 'Already checked in today' }, { status: 400 })

      // ── Geofence check ──────────────────────────────────────────
      // Always require GPS coordinates
      if (!latitude || !longitude) {
        return NextResponse.json({
          message: 'GPS location is required to check in. Please enable location permission in your browser and try again.',
        }, { status: 403 })
      }

      const storeLat = parseFloat(assign.store_lat)
      const storeLng = parseFloat(assign.store_lng)

      // If store has coordinates set, enforce 200m radius
      if (!isNaN(storeLat) && !isNaN(storeLng) && storeLat !== 0 && storeLng !== 0) {
        const distance = Math.round(getDistanceMeters(latitude, longitude, storeLat, storeLng))
        if (distance > GEOFENCE_RADIUS_METERS) {
          return NextResponse.json({
            message: `You are ${distance}m away from ${assign.store_name || 'your store'}. You must be within ${GEOFENCE_RADIUS_METERS}m to check in.`,
            distance,
            allowed: false,
          }, { status: 403 })
        }
      }
      // ────────────────────────────────────────────────────────────

      await query(`
        INSERT INTO attendance
          (assignment_id, employee_id, store_id, shift_id, attendance_date,
           check_in_time, check_in_latitude, check_in_longitude, status)
        VALUES ($1,$2,$3,$4,$5, NOW(),$6,$7,'Present')
      `, [assign.assignment_id, employeeId, assign.store_id, assign.shift_id,
          today, latitude || null, longitude || null])
    }
    else if (action === 'checkout') {
      if (!att)               return NextResponse.json({ message: 'Not checked in today' },  { status: 400 })
      if (att.check_out_time) return NextResponse.json({ message: 'Already checked out' },   { status: 400 })
      await query(`
        UPDATE attendance SET check_out_time = NOW(), check_out_latitude = $1, check_out_longitude = $2
        WHERE employee_id = $3 AND attendance_date = $4
      `, [latitude || null, longitude || null, employeeId, today])
    }
    else if (action === 'break_start') {
      if (!att) return NextResponse.json({ message: 'Not checked in' }, { status: 400 })
      await query(
        `UPDATE attendance SET break_start_time = NOW() WHERE employee_id = $1 AND attendance_date = $2`,
        [employeeId, today]
      )
    }
    else if (action === 'break_end') {
      if (!att) return NextResponse.json({ message: 'Not checked in' }, { status: 400 })
      await query(
        `UPDATE attendance SET break_end_time = NOW() WHERE employee_id = $1 AND attendance_date = $2`,
        [employeeId, today]
      )
    }
    else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    const { rows: updated } = await query(`
      SELECT a.*, s.store_name, sh.shift_name
      FROM attendance a
      JOIN stores s  ON a.store_id  = s.store_id
      JOIN shifts sh ON a.shift_id  = sh.shift_id
      WHERE a.employee_id = $1 AND a.attendance_date = $2
    `, [employeeId, today])

    const u = updated[0]
    return NextResponse.json({
      success: true,
      attendance: {
        attendance_id: u.attendance_id,
        check_in:      u.check_in_time,
        check_out:     u.check_out_time,
        break_start:   u.break_start_time || null,
        break_end:     u.break_end_time   || null,
        status:        u.status,
        store_name:    u.store_name,
        shift_name:    u.shift_name,
      },
    })
  } catch (err: unknown) {
    console.error('Attendance POST error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { employee_id, date } = await request.json()
    await query(`
      UPDATE attendance
      SET check_out_time = NULL, check_out_latitude = NULL, check_out_longitude = NULL
      WHERE employee_id = $1 AND attendance_date = $2
    `, [employee_id, date])
    return NextResponse.json({ success: true, message: 'Employee re-checked in. Timer continues from now.' })
  } catch (err: unknown) {
    return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}
