import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'today'
  const employeeId = user.employeeId
  if (!employeeId) return NextResponse.json({ message: 'No employee record' }, { status: 400 })

  try {
    let dateFilter = ''
    let attFilter  = ''
    if (period === 'today') {
      dateFilter = `AND se.sales_date = CURRENT_DATE`
      attFilter  = `AND a.attendance_date = CURRENT_DATE`
    } else if (period === 'week') {
      dateFilter = `AND se.sales_date >= CURRENT_DATE - INTERVAL '6 days'`
      attFilter  = `AND a.attendance_date >= CURRENT_DATE - INTERVAL '6 days'`
    } else if (period === 'month') {
      dateFilter = `AND se.sales_date >= DATE_TRUNC('month', CURRENT_DATE)`
      attFilter  = `AND a.attendance_date >= DATE_TRUNC('month', CURRENT_DATE)`
    } else {
      dateFilter = `AND se.sales_date >= DATE_TRUNC('year', CURRENT_DATE)`
      attFilter  = `AND a.attendance_date >= DATE_TRUNC('year', CURRENT_DATE)`
    }

    const { rows: attRows } = await query(`
      SELECT
        a.attendance_date::text AS date,
        TO_CHAR(a.check_in_time, 'HH12:MI AM') AS check_in,
        TO_CHAR(a.check_out_time, 'HH12:MI AM') AS check_out,
        CASE WHEN a.check_in_time IS NOT NULL AND a.check_out_time IS NOT NULL
          THEN ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600, 1)::text || 'h'
          ELSE NULL END AS hours_worked,
        s.store_name, sh.shift_name, a.status
      FROM attendance a
      JOIN stores s  ON a.store_id  = s.store_id
      JOIN shifts sh ON a.shift_id  = sh.shift_id
      WHERE a.employee_id = $1 ${attFilter}
      ORDER BY a.attendance_date DESC
    `, [employeeId])

    const { rows: salesRows } = await query(`
      SELECT
        se.sales_date::text AS date,
        s.store_name,
        COALESCE(SUM(si.total_amount), 0) AS day_total,
        COUNT(DISTINCT si.sales_item_id)  AS items_count
      FROM sales_entries se
      JOIN stores s ON se.store_id = s.store_id
      LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      WHERE se.employee_id = $1 ${dateFilter}
      GROUP BY se.sales_date, s.store_name
      ORDER BY se.sales_date DESC
    `, [employeeId])

    const { rows: brandRows } = await query(`
      SELECT b.brand_name, COALESCE(SUM(si.total_amount), 0) AS total
      FROM sales_entries se
      JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      JOIN skus sk    ON si.sku_id       = sk.sku_id
      JOIN categories c ON sk.category_id = c.category_id
      JOIN brands b   ON c.brand_id      = b.brand_id
      WHERE se.employee_id = $1 ${dateFilter}
      GROUP BY b.brand_name ORDER BY total DESC
    `, [employeeId])

    const { rows: todayAtt } = await query(`
      SELECT
        TO_CHAR(a.check_in_time,  'HH12:MI AM') AS check_in,
        TO_CHAR(a.check_out_time, 'HH12:MI AM') AS check_out,
        s.store_name,
        CASE WHEN a.check_in_time IS NOT NULL AND a.check_out_time IS NOT NULL
          THEN ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600, 1)::text || 'h'
          ELSE NULL END AS hours_worked
      FROM attendance a JOIN stores s ON a.store_id = s.store_id
      WHERE a.employee_id = $1 AND a.attendance_date = CURRENT_DATE
    `, [employeeId])

    const totalSales  = salesRows.reduce((s, r) => s + Number(r.day_total || 0), 0)
    const presentDays = attRows.filter(r => r.status === 'Present').length

    return NextResponse.json({
      period,
      attendance: { rows: attRows, present: presentDays, total: attRows.length, absent: attRows.length - presentDays },
      sales:      { rows: salesRows, total: totalSales },
      brands:     brandRows,
      today:      todayAtt[0] || null,
    })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
