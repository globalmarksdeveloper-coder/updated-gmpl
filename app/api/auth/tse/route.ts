import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'tse') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const employeeId = user.employeeId
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  try {
    // TSE info
    const { rows: [tseInfo] } = await query(`
      SELECT u.full_name, e.employee_code, au.full_name AS am_name
      FROM gm_employees e
      JOIN gm_users u ON e.user_id = u.user_id
      LEFT JOIN am_tse_assignments ata ON ata.tse_employee_id = e.employee_id AND ata.is_active = TRUE
      LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
      LEFT JOIN gm_users au ON ae.user_id = au.user_id
      WHERE e.employee_id = $1
    `, [employeeId])

    // All BAs assigned to this TSE with LD + MTD sales + attendance
    const { rows: bas } = await query(`
      SELECT
        e.employee_id, e.employee_code, u.full_name AS ba_name,
        s.store_name, sh.shift_name,
        -- Attendance today
        (SELECT check_in_time  FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS check_in,
        (SELECT check_out_time FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS check_out,
        (SELECT status         FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS att_status,
        -- Days present this month
        (SELECT COUNT(*) FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date >= $2) AS days_present_mtd,
        -- LD Sales (last day = today)
        (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entries se
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE se.employee_id=e.employee_id AND se.sales_date=CURRENT_DATE) AS ld_sales,
        -- MTD Sales
        (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entries se
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE se.employee_id=e.employee_id AND se.sales_date >= $2) AS mtd_sales,
        -- Total working days this month (excluding Sundays)
        (SELECT COUNT(*) FROM generate_series($2::date, CURRENT_DATE, '1 day') d
         WHERE EXTRACT(DOW FROM d) != 0) AS total_working_days
      FROM employee_store_assignments esa
      JOIN gm_employees e  ON esa.employee_id = e.employee_id
      JOIN gm_users u      ON e.user_id = u.user_id
      JOIN roles r         ON e.role_id = r.role_id AND LOWER(r.role_name)='brand ambassador'
      JOIN stores s        ON esa.store_id = s.store_id
      LEFT JOIN shifts sh  ON esa.shift_id = sh.shift_id
      WHERE esa.tse_employee_id = $1 AND esa.is_active = TRUE AND u.is_active = TRUE
      ORDER BY s.store_name, u.full_name
    `, [employeeId, monthStart])

    // Summary stats
    const totalBAs     = bas.length
    const presentToday = bas.filter(b => b.check_in).length
    const ldSales      = bas.reduce((s, b) => s + Number(b.ld_sales || 0), 0)
    const mtdSales     = bas.reduce((s, b) => s + Number(b.mtd_sales || 0), 0)
    const attPct       = totalBAs > 0 ? Math.round((presentToday / totalBAs) * 100) : 0
    const totalWorkDays = bas[0]?.total_working_days || 1
    const avgAttPct    = totalBAs > 0
      ? Math.round(bas.reduce((s, b) => s + (Number(b.days_present_mtd) / Number(totalWorkDays)) * 100, 0) / totalBAs)
      : 0

    // Top 5 BAs by MTD sales
    const topBAs = [...bas]
      .sort((a, b) => Number(b.mtd_sales) - Number(a.mtd_sales))
      .slice(0, 5)

    return NextResponse.json({
      tseName: tseInfo?.full_name,
      tseCode: tseInfo?.employee_code,
      amName:  tseInfo?.am_name,
      stats: {
        total_bas: totalBAs,
        present_today: presentToday,
        absent_today: totalBAs - presentToday,
        att_pct: attPct,
        avg_att_pct_mtd: avgAttPct,
        ld_sales: ldSales,
        mtd_sales: mtdSales,
      },
      bas,
      topBAs,
      today,
      monthStart,
    })
  } catch (err: unknown) {
    console.error('TSE API error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}