import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { rows: pending } = await query(`
      SELECT u.user_id, u.full_name, u.email, r.role_name, u.created_at, u.phone
      FROM gm_users u
      JOIN roles r ON u.role_id = r.role_id
      JOIN gm_employees e ON e.user_id = u.user_id
      WHERE u.is_active = FALSE
      ORDER BY u.created_at DESC
    `)

    const { rows: employees } = await query(`
      SELECT
        e.employee_id, e.employee_code, e.status,
        u.user_id, u.full_name, u.email, u.is_active, u.phone, u.cnic,
        r.role_name, r.role_id,
        s.store_name, sh.shift_name,
        tu.full_name AS tsc_name,
        au.full_name AS am_name,
        ci.city_name
      FROM gm_employees e
      JOIN gm_users u ON e.user_id = u.user_id
      JOIN roles r ON e.role_id = r.role_id
      LEFT JOIN employee_store_assignments a ON a.employee_id = e.employee_id AND a.is_active = TRUE
      LEFT JOIN stores s ON a.store_id = s.store_id
      LEFT JOIN shifts sh ON a.shift_id = sh.shift_id
      LEFT JOIN gm_employees te ON a.tsc_employee_id = te.employee_id
      LEFT JOIN gm_users tu ON te.user_id = tu.user_id
      LEFT JOIN am_tsc_assignments ata ON ata.tsc_employee_id = e.employee_id AND ata.is_active = TRUE
      LEFT JOIN gm_employees ae ON ata.am_employee_id = ae.employee_id
      LEFT JOIN gm_users au ON ae.user_id = au.user_id
      LEFT JOIN city_am_assignments ca ON ca.am_employee_id = e.employee_id AND ca.is_active = TRUE
      LEFT JOIN cities ci ON ca.city_id = ci.city_id
      ORDER BY r.role_id, u.full_name
    `)

    const { rows: stores } = await query(`SELECT store_id, store_name, latitude, longitude, address, city_id FROM stores ORDER BY store_name`)
    const { rows: shifts } = await query(`SELECT shift_id, shift_name, start_time::text, end_time::text FROM shifts ORDER BY shift_id`)
    const { rows: cities } = await query(`SELECT city_id, city_name FROM cities ORDER BY city_name`)

    return NextResponse.json({ pending, employees, stores, shifts, cities })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// Helper: cascade delete an employee and all their data
async function cascadeDeleteEmployee(employeeId: number) {
  await query(`DELETE FROM sales_entry_items WHERE sales_entry_id IN (SELECT sales_entry_id FROM sales_entries WHERE employee_id = $1)`, [employeeId])
  await query(`DELETE FROM sales_entries WHERE employee_id = $1`, [employeeId])
  await query(`DELETE FROM attendance WHERE employee_id = $1`, [employeeId])
  await query(`DELETE FROM employee_store_assignments WHERE employee_id = $1`, [employeeId])
  await query(`DELETE FROM tsc_store_assignments WHERE tsc_employee_id = $1`, [employeeId])
  await query(`DELETE FROM am_tsc_assignments WHERE tsc_employee_id = $1 OR am_employee_id = $1`, [employeeId])
  await query(`DELETE FROM city_am_assignments WHERE am_employee_id = $1`, [employeeId])
  await query(`DELETE FROM gm_employees WHERE employee_id = $1`, [employeeId])
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'approve') {
      await query(`UPDATE gm_users SET is_active = TRUE WHERE user_id = $1`, [body.user_id])
      return NextResponse.json({ success: true, message: 'User approved' })
    }

    if (action === 'reject') {
      const { rows } = await query(`SELECT employee_id FROM gm_employees WHERE user_id = $1`, [body.user_id])
      if (rows.length) await cascadeDeleteEmployee(rows[0].employee_id)
      await query(`DELETE FROM gm_users WHERE user_id = $1`, [body.user_id])
      return NextResponse.json({ success: true, message: 'User rejected and removed' })
    }

    if (action === 'deactivate') {
      await query(`UPDATE gm_users SET is_active = FALSE WHERE user_id = $1`, [body.user_id])
      await query(`UPDATE employee_store_assignments SET is_active = FALSE WHERE employee_id = $1`, [body.employee_id])
      return NextResponse.json({ success: true, message: 'Employee deactivated' })
    }

    if (action === 'activate') {
      await query(`UPDATE gm_users SET is_active = TRUE WHERE user_id = $1`, [body.user_id])
      return NextResponse.json({ success: true, message: 'Employee activated' })
    }

    // Check if employee has records before delete
    if (action === 'check_records') {
      const { employee_id } = body
      const { rows: att } = await query(`SELECT COUNT(*) as cnt FROM attendance WHERE employee_id=$1`, [employee_id])
      const { rows: sal } = await query(`SELECT COUNT(*) as cnt FROM sales_entries WHERE employee_id=$1`, [employee_id])
      const { rows: asgn } = await query(`SELECT COUNT(*) as cnt FROM employee_store_assignments WHERE employee_id=$1 AND is_active=TRUE`, [employee_id])
      return NextResponse.json({
        attendance_count: Number(att[0].cnt),
        sales_count: Number(sal[0].cnt),
        assignment_count: Number(asgn[0].cnt),
        has_records: Number(att[0].cnt) > 0 || Number(sal[0].cnt) > 0
      })
    }

    if (action === 'delete_employee') {
      const { user_id, employee_id } = body
      if (employee_id) await cascadeDeleteEmployee(employee_id)
      await query(`DELETE FROM gm_users WHERE user_id = $1`, [user_id])
      return NextResponse.json({ success: true, message: 'Employee deleted' })
    }

    if (action === 'update_employee') {
      const { user_id, employee_id, full_name, email, phone, role_id } = body
      const cleanPhone = (phone || '').replace(/[\s\-]/g, '')
      if (!full_name?.trim()) return NextResponse.json({ message: 'Full name is required' }, { status: 400 })
      if (!cleanPhone || !/^03\d{9}$/.test(cleanPhone)) return NextResponse.json({ message: 'Phone must be 11 digits starting with 03' }, { status: 400 })
      // Check phone uniqueness (exclude current user)
      const { rows: ph } = await query(`SELECT user_id FROM gm_users WHERE phone = $1 AND user_id != $2`, [cleanPhone, user_id])
      if (ph.length) return NextResponse.json({ message: 'Phone number already in use' }, { status: 409 })
      // Check email uniqueness
      if (email) {
        const { rows: em } = await query(`SELECT user_id FROM gm_users WHERE LOWER(email) = LOWER($1) AND user_id != $2`, [email, user_id])
        if (em.length) return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
      }
      await query(`UPDATE gm_users SET full_name=$1, email=$2, phone=$3, role_id=$4 WHERE user_id=$5`,
        [full_name.trim(), email || null, cleanPhone, role_id, user_id])
      if (employee_id && role_id) await query(`UPDATE gm_employees SET role_id=$1 WHERE employee_id=$2`, [role_id, employee_id])
      return NextResponse.json({ success: true, message: 'Employee updated' })
    }

    if (action === 'add_employee') {
      const { full_name, email, password, role_id, phone, store_id, shift_id, cnic, father_name, address, bank_name, bank_account, iban } = body
      const cleanPhone = (phone || '').replace(/[\s\-]/g, '')
      if (!full_name?.trim()) return NextResponse.json({ message: 'Full name is required' }, { status: 400 })
      if (!password) return NextResponse.json({ message: 'Password is required' }, { status: 400 })
      if (!cleanPhone || !/^03\d{9}$/.test(cleanPhone)) return NextResponse.json({ message: 'Phone must be 11 digits starting with 03' }, { status: 400 })
      // Duplicate checks
      const { rows: ph } = await query(`SELECT user_id FROM gm_users WHERE phone = $1`, [cleanPhone])
      if (ph.length) return NextResponse.json({ message: `Phone ${cleanPhone} is already registered to another employee.` }, { status: 409 })
      if (email) {
        const { rows: em } = await query(`SELECT user_id FROM gm_users WHERE LOWER(email) = LOWER($1)`, [email])
        if (em.length) return NextResponse.json({ message: `Email ${email} is already registered to another employee.` }, { status: 409 })
      }
      if (cnic) {
        const { rows: cn } = await query(`SELECT user_id FROM gm_users WHERE cnic = $1`, [cnic])
        if (cn.length) return NextResponse.json({ message: `CNIC ${cnic} is already registered to another employee. Each CNIC must be unique.` }, { status: 409 })
      }
      if (bank_account) {
        const { rows: ba } = await query(`SELECT user_id FROM gm_users WHERE bank_account = $1`, [bank_account])
        if (ba.length) return NextResponse.json({ message: 'This bank account number is already linked to another employee.' }, { status: 409 })
      }
      const hash = await bcrypt.hash(password, 10)
      const { rows: [u] } = await query(`
        INSERT INTO gm_users (full_name, email, phone, password_hash, role_id, is_active, cnic, father_name, address, bank_name, bank_account, iban)
        VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7,$8,$9,$10,$11) RETURNING user_id
      `, [full_name.trim(), email || null, cleanPhone, hash, role_id, cnic || null, father_name || null, address || null, bank_name || null, bank_account || null, iban || null])
      const { rows: [e] } = await query(`
        INSERT INTO gm_employees (user_id, role_id, phone, status, joining_date)
        VALUES ($1,$2,$3,'active',CURRENT_DATE) RETURNING employee_id
      `, [u.user_id, role_id, cleanPhone])
      if (store_id && shift_id) {
        await query(`INSERT INTO employee_store_assignments (employee_id, store_id, shift_id, start_date, is_active) VALUES ($1,$2,$3,CURRENT_DATE,TRUE)`, [e.employee_id, store_id, shift_id])
      }
      return NextResponse.json({ success: true, message: 'Employee added' })
    }

    if (action === 'assign_store') {
      await query(`UPDATE employee_store_assignments SET is_active=FALSE, end_date=CURRENT_DATE WHERE employee_id=$1 AND is_active=TRUE`, [body.employee_id])
      await query(`INSERT INTO employee_store_assignments (employee_id, store_id, shift_id, start_date, is_active, tsc_employee_id) VALUES ($1,$2,$3,CURRENT_DATE,TRUE,$4)`,
        [body.employee_id, body.store_id, body.shift_id, body.tsc_employee_id || null])
      return NextResponse.json({ success: true, message: 'Store assigned' })
    }

    if (action === 'assign_tsc') {
      await query(`UPDATE am_tsc_assignments SET is_active=FALSE WHERE tsc_employee_id=$1 AND is_active=TRUE`, [body.tsc_employee_id])
      await query(`INSERT INTO am_tsc_assignments (am_employee_id, tsc_employee_id, city_id, start_date, is_active) VALUES ($1,$2,$3,CURRENT_DATE,TRUE)`,
        [body.am_employee_id, body.tsc_employee_id, body.city_id])
      return NextResponse.json({ success: true, message: 'TSC assigned to AM' })
    }

    if (action === 'assign_tsc_store') {
      await query(`INSERT INTO tsc_store_assignments (tsc_employee_id, store_id, start_date, is_active) VALUES ($1,$2,CURRENT_DATE,TRUE) ON CONFLICT DO NOTHING`,
        [body.tsc_employee_id, body.store_id])
      return NextResponse.json({ success: true, message: 'Store assigned to TSC' })
    }

    if (action === 'remove_assignment') {
      await query(`UPDATE employee_store_assignments SET is_active=FALSE, end_date=CURRENT_DATE WHERE employee_id=$1 AND is_active=TRUE`, [body.employee_id])
      return NextResponse.json({ success: true, message: 'Assignment removed' })
    }

    if (action === 'remove_tsc_am') {
      await query(`UPDATE am_tsc_assignments SET is_active=FALSE, end_date=CURRENT_DATE WHERE tsc_employee_id=$1 AND is_active=TRUE`, [body.tsc_employee_id])
      return NextResponse.json({ success: true, message: 'TSC removed from AM' })
    }

    if (action === 'assign_am_city') {
      await query(`UPDATE city_am_assignments SET is_active=FALSE, end_date=CURRENT_DATE WHERE am_employee_id=$1 AND is_active=TRUE`, [body.am_employee_id])
      await query(`INSERT INTO city_am_assignments (city_id, am_employee_id, start_date, is_active) VALUES ($1,$2,CURRENT_DATE,TRUE)`, [body.city_id, body.am_employee_id])
      return NextResponse.json({ success: true, message: 'AM assigned to city' })
    }

    if (action === 'remove_am_city') {
      await query(`UPDATE city_am_assignments SET is_active=FALSE, end_date=CURRENT_DATE WHERE am_employee_id=$1 AND is_active=TRUE`, [body.am_employee_id])
      return NextResponse.json({ success: true, message: 'AM removed from city' })
    }

    if (action === 'update_store_location') {
      await query(`UPDATE stores SET latitude=$1, longitude=$2, address=$3, store_name=COALESCE($4, store_name) WHERE store_id=$5`,
        [body.latitude, body.longitude, body.address || null, body.store_name || null, body.store_id])
      return NextResponse.json({ success: true, message: 'Store updated' })
    }

    if (action === 'add_store') {
      if (!body.store_name) return NextResponse.json({ message: 'Store name is required' }, { status: 400 })
      await query(`INSERT INTO stores (store_name, city_id, latitude, longitude, address) VALUES ($1,$2,$3,$4,$5)`,
        [body.store_name, body.city_id, body.latitude|| null, body.longitude || null, body.address || null])
      return NextResponse.json({ success: true, message: 'Store added' })
    }

    if (action === 'delete_store') {
      await query(`DELETE FROM stores WHERE store_id = $1`, [body.store_id])
      return NextResponse.json({ success: true, message: 'Store deleted' })
    }

    if (action === 'update_price') {
      await query(`UPDATE skus SET retail_price=$1 WHERE sku_id=$2`, [body.retail_price, body.sku_id])
      return NextResponse.json({ success: true, message: 'Price updated' })
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    console.error('Admin user error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}