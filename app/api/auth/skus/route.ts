import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { rows } = await query(`
      SELECT
        sk.sku_id,
        sk.sku_name,
        sk.unit_of_measure,
        sk.retail_price,
        c.category_name,
        b.brand_name
      FROM skus sk
      JOIN categories c ON sk.category_id = c.category_id
      JOIN brands b ON c.brand_id = b.brand_id
      WHERE sk.is_active = TRUE
      ORDER BY b.brand_name, c.category_name, sk.sku_name
    `)
    return NextResponse.json({ skus: rows })
  } catch (err: unknown) {
    console.error('SKUs error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}
