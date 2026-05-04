import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function computeScore(attPct, salesPct) {
  return attPct * 0.4 + salesPct * 0.6
}

export async function GET(req) {
  const user = getUserFromRequest(req)
  if (!user || !['admin', 'am', 'tsc'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'
    const limit  = parseInt(searchParams.get('limit') || '10')

    const dateFilter =
      period === 'today' ? `AND se.sales_date = CURRENT_DATE` :
      period === 'week'  ? `AND se.sales_date >= CURRENT_DATE - INTERVAL '7 days'` :
                           `AND se.sales_date >= DATE_TRUNC('month', CURRENT_DATE)`

    const attFilter =
      period === 'today' ? `AND a2.attendance_date = CURRENT_DATE` :
      period === 'week'  ? `AND a2.attendance_date >= CURRENT_DATE - INTERVAL '7 days'` :
                           `AND a2.attendance_date >= DATE_TRUNC('month', CURRENT_DATE)`

    const possibleDaysQ =
      period === 'today' ? `1` :
      period === 'week'  ? `(SELECT COUNT(*) FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d WHERE EXTRACT(DOW FROM d) != 0)` :
                           `(SELECT COUNT(*) FROM generate_series(DATE_TRUNC('month', CURRENT_DATE)::date, CURRENT_DATE, '1 day') d WHERE EXTRACT(DOW FROM d) != 0)`

    const { rows: rawBAs } = await query(`
      SELECT e.employee_id, e.employee_code, u.full_name,
        COALESCE(SUM(si.total_amount), 0)::numeric(12,2) AS total_sales,
        COUNT(DISTINCT se.sales_entry_id) AS sales_entries,
        COALESCE(SUM(si.qty), 0) AS total_units,
        (SELECT COUNT(*) FROM attendance a2 WHERE a2.employee_id = e.employee_id ${attFilter}) AS days_present,
        ${possibleDaysQ}::int AS possible_days,
        st2.store_name, tu.full_name AS tsc_name, au.full_name AS am_name
      FROM gm_employees e
      JOIN gm_users u ON e.user_id = u.user_id
      JOIN roles r    ON e.role_id = r.role_id AND LOWER(r.role_name) = 'brand ambassador'
      LEFT JOIN sales_entries se ON se.employee_id = e.employee_id ${dateFilter}
      LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      LEFT JOIN (SELECT DISTINCT ON (employee_id) employee_id, store_id, tsc_employee_id FROM employee_store_assignments WHERE is_active=TRUE ORDER BY employee_id, start_date DESC) esa ON esa.employee_id = e.employee_id
      LEFT JOIN stores st2 ON esa.store_id = st2.store_id
      LEFT JOIN gm_employees te ON esa.tsc_employee_id = te.employee_id
      LEFT JOIN gm_users tu ON te.user_id = tu.user_id
      LEFT JOIN (SELECT DISTINCT ON (tsc_employee_id) tsc_employee_id, am_employee_id FROM am_tsc_assignments WHERE is_active=TRUE) ata ON ata.tsc_employee_id = te.employee_id
      LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
      LEFT JOIN gm_users au ON ae.user_id = au.user_id
      WHERE u.is_active = TRUE
      GROUP BY e.employee_id, e.employee_code, u.full_name, st2.store_name, tu.full_name, au.full_name
    `, [])

    const maxBASales = Math.max(1, ...rawBAs.map(b => Number(b.total_sales)))
    const topBAs = rawBAs.map(b => {
      const attPct   = b.possible_days > 0 ? (Number(b.days_present) / Number(b.possible_days)) * 100 : 0
      const salesPct = (Number(b.total_sales) / maxBASales) * 100
      return { ...b, att_pct: Math.round(attPct), score: computeScore(attPct, salesPct) }
    }).sort((a, b) => b.score - a.score).slice(0, limit)

    const { rows: rawTSCs } = await query(`
      SELECT te.employee_id, te.employee_code, tu.full_name,
        COUNT(DISTINCT e.employee_id) AS ba_count,
        COALESCE(SUM(si.total_amount), 0)::numeric(12,2) AS total_sales,
        (SELECT COUNT(*) FROM attendance a2 WHERE a2.employee_id = te.employee_id ${attFilter}) AS days_present,
        ${possibleDaysQ}::int AS possible_days,
        au.full_name AS am_name, ci.city_name
      FROM gm_employees te
      JOIN gm_users tu ON te.user_id = tu.user_id
      JOIN roles tr    ON te.role_id = tr.role_id AND LOWER(tr.role_name) = 'tsc'
      LEFT JOIN employee_store_assignments esa ON esa.tsc_employee_id = te.employee_id AND esa.is_active = TRUE
      LEFT JOIN gm_employees e ON esa.employee_id = e.employee_id
      LEFT JOIN sales_entries se ON se.employee_id = e.employee_id ${dateFilter}
      LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      LEFT JOIN am_tsc_assignments ata ON ata.tsc_employee_id = te.employee_id AND ata.is_active = TRUE
      LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
      LEFT JOIN gm_users au ON ae.user_id = au.user_id
      LEFT JOIN city_am_assignments ca ON ca.am_employee_id = ae.employee_id AND ca.is_active = TRUE
      LEFT JOIN cities ci ON ca.city_id = ci.city_id
      WHERE tu.is_active = TRUE
      GROUP BY te.employee_id, te.employee_code, tu.full_name, au.full_name, ci.city_name
    `, [])

    const maxTSCSales = Math.max(1, ...rawTSCs.map(t => Number(t.total_sales)))
    const topTSCs = rawTSCs.map(t => {
      const attPct   = t.possible_days > 0 ? (Number(t.days_present) / Number(t.possible_days)) * 100 : 0
      const salesPct = (Number(t.total_sales) / maxTSCSales) * 100
      return { ...t, att_pct: Math.round(attPct), score: computeScore(attPct, salesPct) }
    }).sort((a, b) => b.score - a.score).slice(0, limit)

    const { rows: rawAMs } = await query(`
      SELECT ae.employee_id, ae.employee_code, au.full_name, ci.city_name,
        COUNT(DISTINCT te.employee_id) AS tsc_count,
        COUNT(DISTINCT e.employee_id)  AS ba_count,
        COALESCE(SUM(si.total_amount), 0)::numeric(12,2) AS total_sales,
        (SELECT COUNT(*) FROM attendance a2 WHERE a2.employee_id = ae.employee_id ${attFilter}) AS days_present,
        ${possibleDaysQ}::int AS possible_days
      FROM gm_employees ae
      JOIN gm_users au ON ae.user_id = au.user_id
      JOIN roles ar    ON ae.role_id = ar.role_id AND LOWER(ar.role_name) = 'area manager'
      LEFT JOIN am_tsc_assignments ata ON ata.am_employee_id = ae.employee_id AND ata.is_active = TRUE
      LEFT JOIN gm_employees te ON ata.tsc_employee_id = te.employee_id
      LEFT JOIN employee_store_assignments esa ON esa.tsc_employee_id = te.employee_id AND esa.is_active = TRUE
      LEFT JOIN gm_employees e ON esa.employee_id = e.employee_id
      LEFT JOIN sales_entries se ON se.employee_id = e.employee_id ${dateFilter}
      LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      LEFT JOIN city_am_assignments ca ON ca.am_employee_id = ae.employee_id AND ca.is_active = TRUE
      LEFT JOIN cities ci ON ca.city_id = ci.city_id
      WHERE au.is_active = TRUE
      GROUP BY ae.employee_id, ae.employee_code, au.full_name, ci.city_name
    `, [])

    const maxAMSales = Math.max(1, ...rawAMs.map(a => Number(a.total_sales)))
    const topAMs = rawAMs.map(a => {
      const attPct   = a.possible_days > 0 ? (Number(a.days_present) / Number(a.possible_days)) * 100 : 0
      const salesPct = (Number(a.total_sales) / maxAMSales) * 100
      return { ...a, att_pct: Math.round(attPct), score: computeScore(attPct, salesPct) }
    }).sort((a, b) => b.score - a.score).slice(0, limit)

    return NextResponse.json({ topBAs, topTSCs, topAMs, period })
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
