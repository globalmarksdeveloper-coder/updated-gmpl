import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type        = searchParams.get('type')
  const date_from   = searchParams.get('date_from') || new Date().toISOString().split('T')[0]
  const date_to     = searchParams.get('date_to')   || new Date().toISOString().split('T')[0]
  const role_filter = searchParams.get('role')       || 'all'
  const emp_filter  = searchParams.get('employee_id')|| 'all'
  const store_filter= searchParams.get('store_id')  || 'all'

  try {
    if (type === 'overview') {
      const { rows: stats } = await query(`
        SELECT
          (SELECT COUNT(*) FROM gm_employees e JOIN gm_users u ON e.user_id=u.user_id WHERE u.is_active=TRUE) AS total_employees,
          (SELECT COUNT(*) FROM gm_employees e JOIN gm_users u ON e.user_id=u.user_id JOIN roles r ON e.role_id=r.role_id WHERE LOWER(r.role_name)='brand ambassador' AND u.is_active=TRUE) AS total_bas,
          (SELECT COUNT(*) FROM gm_employees e JOIN gm_users u ON e.user_id=u.user_id JOIN roles r ON e.role_id=r.role_id WHERE LOWER(r.role_name)='tsc' AND u.is_active=TRUE) AS total_tscs,
          (SELECT COUNT(*) FROM gm_employees e JOIN gm_users u ON e.user_id=u.user_id JOIN roles r ON e.role_id=r.role_id WHERE LOWER(r.role_name)='area manager' AND u.is_active=TRUE) AS total_ams,
          (SELECT COUNT(*) FROM stores) AS total_stores,
          -- Present today by role
          (SELECT COUNT(*) FROM attendance a JOIN gm_employees e ON a.employee_id=e.employee_id JOIN roles r ON e.role_id=r.role_id WHERE a.attendance_date=CURRENT_DATE AND LOWER(r.role_name)='brand ambassador') AS present_bas,
          (SELECT COUNT(*) FROM attendance a JOIN gm_employees e ON a.employee_id=e.employee_id JOIN roles r ON e.role_id=r.role_id WHERE a.attendance_date=CURRENT_DATE AND LOWER(r.role_name)='tsc') AS present_tscs,
          (SELECT COUNT(*) FROM attendance a JOIN gm_employees e ON a.employee_id=e.employee_id JOIN roles r ON e.role_id=r.role_id WHERE a.attendance_date=CURRENT_DATE AND LOWER(r.role_name)='area manager') AS present_ams,
          -- Sales LD and MTD
          (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entry_items si JOIN sales_entries se ON si.sales_entry_id=se.sales_entry_id WHERE se.sales_date=CURRENT_DATE) AS ld_sales,
          (SELECT COALESCE(SUM(si.total_amount),0) FROM sales_entry_items si JOIN sales_entries se ON si.sales_entry_id=se.sales_entry_id WHERE se.sales_date >= DATE_TRUNC('month',CURRENT_DATE)) AS mtd_sales,
          (SELECT COUNT(*) FROM gm_users u JOIN gm_employees e ON e.user_id=u.user_id WHERE u.is_active=FALSE) AS pending_approvals
      `)
      const { rows: salesByStore } = await query(`
        SELECT s.store_name, COALESCE(SUM(si.total_amount),0) AS total_sales, COUNT(DISTINCT se.employee_id) AS ba_count
        FROM stores s
        LEFT JOIN sales_entries se ON se.store_id=s.store_id AND se.sales_date=CURRENT_DATE
        LEFT JOIN sales_entry_items si ON si.sales_entry_id=se.sales_entry_id
        GROUP BY s.store_name ORDER BY total_sales DESC
      `)
      const { rows: salesByBrand } = await query(`
        SELECT b.brand_name, COALESCE(SUM(si.total_amount),0) AS total_sales
        FROM brands b
        LEFT JOIN categories c ON c.brand_id=b.brand_id
        LEFT JOIN skus sk ON sk.category_id=c.category_id
        LEFT JOIN sales_entry_items si ON si.sku_id=sk.sku_id
        LEFT JOIN sales_entries se ON si.sales_entry_id=se.sales_entry_id AND se.sales_date=CURRENT_DATE
        GROUP BY b.brand_name ORDER BY total_sales DESC
      `)
      return NextResponse.json({ stats: stats[0], salesByStore, salesByBrand })
    }

    if (type === 'attendance') {
      let conditions = [`a.attendance_date BETWEEN $1 AND $2`]
      let params = [date_from, date_to]
      let idx = 3
      if (emp_filter !== 'all') { conditions.push(`e.employee_id = $${idx++}`); params.push(emp_filter) }
      if (store_filter !== 'all') { conditions.push(`a.store_id = $${idx++}`); params.push(store_filter) }
      if (role_filter !== 'all') { conditions.push(`r.role_name = $${idx++}`); params.push(role_filter) }
      const { rows } = await query(`
        SELECT a.attendance_date::text AS date, e.employee_id AS employee_id_num, u.full_name, e.employee_code, r.role_name,
          s.store_name, sh.shift_name,
          TO_CHAR(a.check_in_time, 'HH12:MI AM') AS check_in,
          TO_CHAR(a.check_out_time, 'HH12:MI AM') AS check_out,
          CASE WHEN a.check_in_time IS NOT NULL AND a.check_out_time IS NOT NULL
            THEN ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600, 1)::text || 'h'
            ELSE '—' END AS hours,
          a.status, tu.full_name AS tsc_name, au.full_name AS am_name
        FROM attendance a
        JOIN gm_employees e ON a.employee_id = e.employee_id
        JOIN gm_users u ON e.user_id = u.user_id
        JOIN roles r ON e.role_id = r.role_id
        JOIN stores s ON a.store_id = s.store_id
        JOIN shifts sh ON a.shift_id = sh.shift_id
        LEFT JOIN (
          SELECT DISTINCT ON (employee_id) employee_id, tsc_employee_id
          FROM employee_store_assignments WHERE is_active=TRUE
        ) esa ON esa.employee_id = e.employee_id
        LEFT JOIN gm_employees te ON esa.tsc_employee_id = te.employee_id
        LEFT JOIN gm_users tu ON te.user_id = tu.user_id
        LEFT JOIN (
          SELECT DISTINCT ON (tsc_employee_id) tsc_employee_id, am_employee_id
          FROM am_tsc_assignments WHERE is_active=TRUE
        ) ata ON ata.tsc_employee_id = te.employee_id
        LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
        LEFT JOIN gm_users au ON ae.user_id = au.user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY a.attendance_date DESC, s.store_name, u.full_name
      `, params)
      return NextResponse.json({ rows })
    }

    if (type === 'sales') {
      let conditions = [`se.sales_date BETWEEN $1 AND $2`]
      let params = [date_from, date_to]
      let idx = 3
      if (emp_filter !== 'all') { conditions.push(`se.employee_id = $${idx++}`); params.push(emp_filter) }
      if (store_filter !== 'all') { conditions.push(`se.store_id = $${idx++}`); params.push(store_filter) }
      if (role_filter !== 'all') { conditions.push(`r.role_name = $${idx++}`); params.push(role_filter) }
      const { rows } = await query(`
        SELECT
          se.sales_date::text AS date,
          e.employee_id AS employee_id_num,
          u.full_name, e.employee_code, r.role_name, s.store_name,
          b.brand_name, c.category_name, sk.sku_name,
          si.qty, si.retail_price, si.total_amount, se.remarks,
          tu.full_name AS tsc_name, au.full_name AS am_name
        FROM sales_entries se
        JOIN gm_employees e ON se.employee_id = e.employee_id
        JOIN gm_users u ON e.user_id = u.user_id
        JOIN roles r ON e.role_id = r.role_id
        JOIN stores s ON se.store_id = s.store_id
        LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
        LEFT JOIN skus sk ON si.sku_id = sk.sku_id
        LEFT JOIN categories c ON sk.category_id = c.category_id
        LEFT JOIN brands b ON c.brand_id = b.brand_id
        LEFT JOIN (
          SELECT DISTINCT ON (employee_id) employee_id, tsc_employee_id
          FROM employee_store_assignments WHERE is_active=TRUE
        ) esa ON esa.employee_id = e.employee_id
        LEFT JOIN gm_employees te ON esa.tsc_employee_id = te.employee_id
        LEFT JOIN gm_users tu ON te.user_id = tu.user_id
        LEFT JOIN (
          SELECT DISTINCT ON (tsc_employee_id) tsc_employee_id, am_employee_id
          FROM am_tsc_assignments WHERE is_active=TRUE
        ) ata ON ata.tsc_employee_id = te.employee_id
        LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
        LEFT JOIN gm_users au ON ae.user_id = au.user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY se.sales_date DESC, s.store_name, u.full_name, b.brand_name
      `, params)
      return NextResponse.json({ rows })
    }

    if (type === 'prices') {
      const { rows } = await query(`
        SELECT sk.sku_id, sk.sku_name, sk.unit_of_measure, sk.retail_price,
               c.category_name, b.brand_name, b.brand_id, c.category_id
        FROM skus sk
        JOIN categories c ON sk.category_id = c.category_id
        JOIN brands b ON c.brand_id = b.brand_id
        WHERE sk.is_active = TRUE
        ORDER BY b.brand_name, c.category_name, sk.sku_name
      `)
      return NextResponse.json({ rows })
    }

    return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
  } catch (err: unknown) {
    console.error('Admin reports error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { type, date_from, date_to, employee_id, role_filter, store_id } = body

    const df = date_from || '2020-01-01'
    const dt = date_to   || new Date().toISOString().split('T')[0]

    if (type === 'attendance_download') {
      let conditions = [`a.attendance_date BETWEEN $1 AND $2`]
      let params: string[] = [df, dt]
      let idx = 3
      if (employee_id && employee_id !== 'all') { conditions.push(`e.employee_id = $${idx++}`); params.push(employee_id) }
      if (store_id    && store_id    !== 'all') { conditions.push(`a.store_id = $${idx++}`);    params.push(store_id) }
      if (role_filter && role_filter !== 'all') { conditions.push(`LOWER(r.role_name) = LOWER($${idx++})`); params.push(role_filter) }

      const { rows } = await query(`
        SELECT
          a.attendance_date::text          AS "Date",
          u.full_name                      AS "Employee Name",
          e.employee_code                  AS "Employee Code",
          r.role_name                      AS "Role",
          s.store_name                     AS "Store",
          sh.shift_name                    AS "Shift",
          TO_CHAR(a.check_in_time,  'HH12:MI AM') AS "Check In",
          TO_CHAR(a.check_out_time, 'HH12:MI AM') AS "Check Out",
          TO_CHAR(a.break_start_time,'HH12:MI AM') AS "Break Start",
          TO_CHAR(a.break_end_time,  'HH12:MI AM') AS "Break End",
          CASE WHEN a.check_in_time IS NOT NULL AND a.check_out_time IS NOT NULL
            THEN ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600,1)::text
            ELSE '' END                    AS "Hours Worked",
          a.status                         AS "Status",
          tu.full_name                     AS "TSC",
          au.full_name                     AS "Area Manager"
        FROM attendance a
        JOIN gm_employees e  ON a.employee_id = e.employee_id
        JOIN gm_users u      ON e.user_id = u.user_id
        JOIN roles r         ON e.role_id = r.role_id
        JOIN stores s        ON a.store_id = s.store_id
        LEFT JOIN shifts sh  ON a.shift_id = sh.shift_id
        LEFT JOIN (SELECT DISTINCT ON (employee_id) employee_id, tsc_employee_id FROM employee_store_assignments WHERE is_active=TRUE) esa ON esa.employee_id=e.employee_id
        LEFT JOIN gm_employees te ON esa.tsc_employee_id=te.employee_id
        LEFT JOIN gm_users tu ON te.user_id=tu.user_id
        LEFT JOIN (SELECT DISTINCT ON (tsc_employee_id) tsc_employee_id, am_employee_id FROM am_tsc_assignments WHERE is_active=TRUE) ata ON ata.tsc_employee_id=te.employee_id
        LEFT JOIN gm_employees ae ON ata.am_employee_id=ae.employee_id
        LEFT JOIN gm_users au ON ae.user_id=au.user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY a.attendance_date DESC, u.full_name
      `, params)
      return NextResponse.json({ rows, filename: `attendance_${df}_to_${dt}` })
    }

    if (type === 'sales_download') {
      let conditions = [`se.sales_date BETWEEN $1 AND $2`]
      let params: string[] = [df, dt]
      let idx = 3
      if (employee_id && employee_id !== 'all') { conditions.push(`se.employee_id = $${idx++}`); params.push(employee_id) }
      if (store_id    && store_id    !== 'all') { conditions.push(`se.store_id = $${idx++}`);    params.push(store_id) }
      if (role_filter && role_filter !== 'all') { conditions.push(`LOWER(r.role_name) = LOWER($${idx++})`); params.push(role_filter) }

      const { rows } = await query(`
        SELECT
          se.sales_date::text   AS "Date",
          u.full_name           AS "Employee Name",
          e.employee_code       AS "Employee Code",
          r.role_name           AS "Role",
          s.store_name          AS "Store",
          b.brand_name          AS "Brand",
          c.category_name       AS "Category",
          sk.sku_name           AS "Product",
          sk.unit_of_measure    AS "UOM",
          si.qty                AS "Qty",
          si.retail_price       AS "Price (Rs)",
          si.total_amount       AS "Total (Rs)",
          se.remarks            AS "Remarks",
          tu.full_name          AS "TSC",
          au.full_name          AS "Area Manager"
        FROM sales_entries se
        JOIN gm_employees e  ON se.employee_id = e.employee_id
        JOIN gm_users u      ON e.user_id = u.user_id
        JOIN roles r         ON e.role_id = r.role_id
        JOIN stores s        ON se.store_id = s.store_id
        LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
        LEFT JOIN skus sk     ON si.sku_id = sk.sku_id
        LEFT JOIN categories c ON sk.category_id = c.category_id
        LEFT JOIN brands b    ON c.brand_id = b.brand_id
        LEFT JOIN (SELECT DISTINCT ON (employee_id) employee_id, tsc_employee_id FROM employee_store_assignments WHERE is_active=TRUE) esa ON esa.employee_id=e.employee_id
        LEFT JOIN gm_employees te ON esa.tsc_employee_id=te.employee_id
        LEFT JOIN gm_users tu ON te.user_id=tu.user_id
        LEFT JOIN (SELECT DISTINCT ON (tsc_employee_id) tsc_employee_id, am_employee_id FROM am_tsc_assignments WHERE is_active=TRUE) ata ON ata.tsc_employee_id=te.employee_id
        LEFT JOIN gm_employees ae ON ata.am_employee_id=ae.employee_id
        LEFT JOIN gm_users au ON ae.user_id=au.user_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY se.sales_date DESC, u.full_name, b.brand_name
      `, params)
      return NextResponse.json({ rows, filename: `sales_${df}_to_${dt}` })
    }

    return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}