import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// Pakistan public holidays 2025/2026
const PK_HOLIDAYS = [
  { date: '2025-02-05', name: 'Kashmir Day' },
  { date: '2025-03-23', name: 'Pakistan Day' },
  { date: '2025-05-01', name: 'Labour Day' },
  { date: '2025-08-14', name: 'Independence Day' },
  { date: '2025-11-09', name: 'Iqbal Day' },
  { date: '2025-12-25', name: 'Quaid-e-Azam Day' },
  { date: '2026-02-05', name: 'Kashmir Day' },
  { date: '2026-03-23', name: 'Pakistan Day' },
  { date: '2026-05-01', name: 'Labour Day' },
  { date: '2026-08-14', name: 'Independence Day' },
  { date: '2026-11-09', name: 'Iqbal Day' },
  { date: '2026-12-25', name: 'Quaid-e-Azam Day' },
]

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { rows } = await query(`SELECT * FROM holidays ORDER BY holiday_date DESC`)
    return NextResponse.json({ holidays: rows, pk_holidays: PK_HOLIDAYS })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'add_holiday') {
      const { holiday_date, holiday_name, description } = body
      if (!holiday_date || !holiday_name) return NextResponse.json({ message: 'Date and name required' }, { status: 400 })
      // Check duplicate
      const { rows: existing } = await query(`SELECT holiday_id FROM holidays WHERE holiday_date = $1`, [holiday_date])
      if (existing.length) return NextResponse.json({ message: 'Holiday already exists for this date' }, { status: 409 })
      await query(`INSERT INTO holidays (holiday_date, holiday_name, description) VALUES ($1, $2, $3)`,
        [holiday_date, holiday_name, description || null])
      return NextResponse.json({ success: true, message: 'Holiday added' })
    }

    if (action === 'add_pk_holidays') {
      // Bulk add Pakistan holidays
      let added = 0
      for (const h of PK_HOLIDAYS) {
        const { rows: ex } = await query(`SELECT holiday_id FROM holidays WHERE holiday_date = $1`, [h.date])
        if (!ex.length) {
          await query(`INSERT INTO holidays (holiday_date, holiday_name, description) VALUES ($1, $2, $3)`,
            [h.date, h.name, 'Pakistan Public Holiday'])
          added++
        }
      }
      return NextResponse.json({ success: true, message: `${added} Pakistan holidays added` })
    }

    if (action === 'delete_holiday') {
      await query(`DELETE FROM holidays WHERE holiday_id = $1`, [body.holiday_id])
      return NextResponse.json({ success: true, message: 'Holiday deleted' })
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
