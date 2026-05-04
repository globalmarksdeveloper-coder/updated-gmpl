import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'am') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const employeeId = user.employeeId
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  try {
    // AM info
    const { rows: [amInfo] } = await query(`
      SELECT u.full_name, e.employee_code, c.city_name
      FROM gm_employees e
      JOIN gm_users u ON e.user_id = u.user_id
      LEFT JOIN city_am_assignments ca ON ca.am_employee_id = e.employee_id AND ca.is_active = TRUE
      LEFT JOIN cities c ON ca.city_id = c.city_id
      WHERE e.employee_id = $1 LIMIT 1
    `, [employeeId])

    // All TSCs under this AM with their BAs stats
    const { rows: tscs } = await query(`
      SELECT
        te.employee_id AS tsc_id, te.employee_code AS tsc_code, tu.full_name AS tsc_name,
        -- TSC attendance today
        (SELECT check_in_time FROM attendance a WHERE a.employee_id=te.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS tsc_check_in,
        -- Count BAs under this TSC
        (SELECT COUNT(*) FROM employee_store_assignments esa
         JOIN gm_employees be ON esa.employee_id=be.employee_id
         JOIN roles br ON be.role_id=br.role_id AND LOWER(br.role_name)='brand ambassador'
         WHERE esa.tsc_employee_id=te.employee_id AND esa.is_active=TRUE) AS total_bas,
        -- BAs present today
        (SELECT COUNT(*) FROM employee_store_assignments esa
         JOIN attendance a ON a.employee_id=esa.employee_id AND a.attendance_date=CURRENT_DATE
         WHERE esa.tsc_employee_id=te.employee_id AND esa.is_active=TRUE) AS present_bas,
        -- LD sales
        (SELECT COALESCE(SUM(si.total_amount),0) FROM employee_store_assignments esa
         JOIN sales_entries se ON se.employee_id=esa.employee_id AND se.sales_date=CURRENT_DATE
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE esa.tsc_employee_id=te.employee_id AND esa.is_active=TRUE) AS ld_sales,
        -- MTD sales
        (SELECT COALESCE(SUM(si.total_amount),0) FROM employee_store_assignments esa
         JOIN sales_entries se ON se.employee_id=esa.employee_id AND se.sales_date >= $2
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE esa.tsc_employee_id=te.employee_id AND esa.is_active=TRUE) AS mtd_sales
      FROM am_tsc_assignments ata
      JOIN gm_employees te ON ata.tsc_employee_id = te.employee_id
      JOIN gm_users tu ON te.user_id = tu.user_id
      WHERE ata.am_employee_id = $1 AND ata.is_active = TRUE
      ORDER BY mtd_sales DESC
    `, [employeeId, monthStart])

    // All BAs under this AM
    const { rows: bas } = await query(`
      SELECT
        e.employee_id, e.employee_code, u.full_name AS ba_name,
        s.store_name, sh.shift_name,
        tu.full_name AS tsc_name,
        (SELECT check_in_time FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS check_in,
        (SELECT check_out_time FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date=CURRENT_DATE LIMIT 1) AS check_out,
        (SELECT COUNT(*) FROM attendance a WHERE a.employee_id=e.employee_id AND a.attendance_date >= $2) AS days_present_mtd,
        (SELECT COUNT(*) FROM generate_series($2::date, CURRENT_DATE, '1 day') d WHERE EXTRACT(DOW FROM d) != 0) AS total_working_days,
        (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entries se
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE se.employee_id=e.employee_id AND se.sales_date=CURRENT_DATE) AS ld_sales,
        (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entries se
         JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
         WHERE se.employee_id=e.employee_id AND se.sales_date >= $2) AS mtd_sales
      FROM am_tsc_assignments ata
      JOIN employee_store_assignments esa ON esa.tsc_employee_id=ata.tsc_employee_id AND esa.is_active=TRUE
      JOIN gm_employees e ON esa.employee_id=e.employee_id
      JOIN gm_users u ON e.user_id=u.user_id
      JOIN roles r ON e.role_id=r.role_id AND LOWER(r.role_name)='brand ambassador'
      JOIN stores s ON esa.store_id=s.store_id
      LEFT JOIN shifts sh ON esa.shift_id=sh.shift_id
      LEFT JOIN gm_employees te ON esa.tsc_employee_id=te.employee_id
      LEFT JOIN gm_users tu ON te.user_id=tu.user_id
      WHERE ata.am_employee_id = $1 AND ata.is_active=TRUE AND u.is_active=TRUE
      ORDER BY mtd_sales DESC
    `, [employeeId, monthStart])

    const totalTSCs    = tscs.length
    const presentTSCs  = tscs.filter((t: any) => t.tsc_check_in).length
    const totalBAs     = bas.length
    const presentBAs   = bas.filter((b: any) => b.check_in).length
    const ldSales      = bas.reduce((s: number, b: any) => s + Number(b.ld_sales || 0), 0)
    const mtdSales     = bas.reduce((s: number, b: any) => s + Number(b.mtd_sales || 0), 0)
    const attPct       = totalBAs > 0 ? Math.round((presentBAs / totalBAs) * 100) : 0
    const topBAs       = [...bas].sort((a: any, b: any) => Number(b.mtd_sales) - Number(a.mtd_sales)).slice(0, 5)

    return NextResponse.json({
      amName:  amInfo?.full_name,
      amCode:  amInfo?.employee_code,
      cityName: amInfo?.city_name,
      stats: {
        total_tscs: totalTSCs, present_tscs: presentTSCs,
        total_bas: totalBAs,   present_bas: presentBAs,
        absent_bas: totalBAs - presentBAs,
        ld_sales: ldSales, mtd_sales: mtdSales,
        att_pct: attPct,
      },
      tscs, bas, topBAs, monthStart,
    })
  } catch (err: unknown) {
    console.error('AM API error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}