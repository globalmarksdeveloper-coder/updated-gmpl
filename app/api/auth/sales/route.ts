import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const today      = new Date().toISOString().split('T')[0]
    const employeeId = user.employeeId

    if (!employeeId) return NextResponse.json({ sales: [] })

    const { rows } = await query(`
      SELECT
        se.sales_entry_id,
        se.sales_date::text,
        se.remarks,
        s.store_name,
        COALESCE(SUM(si.total_amount), 0) AS total_sales,
        COUNT(si.sales_item_id)           AS item_count
      FROM sales_entries se
      JOIN stores s ON se.store_id = s.store_id
      LEFT JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      WHERE se.employee_id = $1 AND se.sales_date = $2
      GROUP BY se.sales_entry_id, se.sales_date, se.remarks, s.store_name
      ORDER BY se.sales_entry_id DESC
    `, [employeeId, today])

    // Brand totals for today
    const { rows: brandRows } = await query<{ brand_name: string; total: string }>(`
      SELECT b.brand_name, COALESCE(SUM(si.total_amount), 0) AS total
      FROM sales_entries se
      JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      JOIN skus sk ON si.sku_id = sk.sku_id
      JOIN categories c ON sk.category_id = c.category_id
      JOIN brands b ON c.brand_id = b.brand_id
      WHERE se.employee_id = $1 AND se.sales_date = $2
      GROUP BY b.brand_name
    `, [employeeId, today])

    const brandTotals: Record<string, number> = {}
    brandRows.forEach(r => { brandTotals[r.brand_name] = parseFloat(r.total) || 0 })

    return NextResponse.json({ sales: rows, brandTotals })
  } catch (err: unknown) {
    console.error('Sales GET error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { items, remarks, image } = await request.json()

    // Save image to public/uploads if provided
    let imagePath = null
    if (image) {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'sales')
      await mkdir(uploadDir, { recursive: true })
      const filename = `sale-${Date.now()}.jpg`
      await writeFile(join(uploadDir, filename), buffer)
      imagePath = `/uploads/sales/${filename}`
    }
    const today      = new Date().toISOString().split('T')[0]
    const employeeId = user.employeeId

    if (!employeeId) return NextResponse.json({ message: 'No employee record' }, { status: 400 })

    const { rows: assignRows } = await query(
      `SELECT * FROM employee_store_assignments WHERE employee_id = $1 AND is_active = TRUE LIMIT 1`,
      [employeeId]
    )
    const assign = assignRows[0]
    if (!assign) return NextResponse.json({ message: 'No active store assignment found' }, { status: 400 })

    // Always insert a new sales entry (multiple entries per day allowed)
    const { rows: [entry] } = await query(`
      INSERT INTO sales_entries (assignment_id, employee_id, store_id, sales_date, remarks, image_path)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING sales_entry_id
    `, [assign.assignment_id, employeeId, assign.store_id, today, remarks || null, imagePath])

    for (const item of items) {
      if (item.qty > 0) {
        await query(`
          INSERT INTO sales_entry_items (sales_entry_id, sku_id, qty, retail_price)
          VALUES ($1, $2, $3, $4)
        `, [entry.sales_entry_id, item.sku_id, item.qty, item.retail_price])
      }
    }

    return NextResponse.json({ success: true, sales_entry_id: entry.sales_entry_id })
  } catch (err: unknown) {
    console.error('Sales POST error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { sales_entry_id } = await request.json()
    const employeeId = user.employeeId

    // Make sure it belongs to this employee
    const { rows } = await query(
      'SELECT sales_entry_id FROM sales_entries WHERE sales_entry_id = $1 AND employee_id = $2',
      [sales_entry_id, employeeId]
    )
    if (!rows[0]) return NextResponse.json({ message: 'Entry not found' }, { status: 404 })

    // Delete items first then entry
    await query('DELETE FROM sales_entry_items WHERE sales_entry_id = $1', [sales_entry_id])
    await query('DELETE FROM sales_entries WHERE sales_entry_id = $1', [sales_entry_id])

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Sales DELETE error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}