import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { rows: brands } = await query(`SELECT brand_id, brand_name FROM brands ORDER BY brand_name`)
    const { rows: categories } = await query(`
      SELECT c.category_id, c.category_name, b.brand_id, b.brand_name
      FROM categories c JOIN brands b ON c.brand_id = b.brand_id ORDER BY b.brand_name, c.category_name`)
    const { rows: skus } = await query(`
      SELECT sk.sku_id, sk.sku_name, sk.unit_of_measure, sk.retail_price, sk.is_active,
             c.category_id, c.category_name, b.brand_id, b.brand_name
      FROM skus sk
      JOIN categories c ON sk.category_id = c.category_id
      JOIN brands b ON c.brand_id = b.brand_id
      ORDER BY b.brand_name, c.category_name, sk.sku_name`)
    return NextResponse.json({ brands, categories, skus })
  } catch (err: unknown) { return NextResponse.json({ message: (err instanceof Error ? err.message : String(err)) }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'add_brand') {
      const { rows:[b] } = await query(`INSERT INTO brands (brand_name) VALUES ($1) RETURNING brand_id, brand_name`, [body.brand_name])
      return NextResponse.json({ success:true, message:'Brand added', brand:b })
    }
    if (action === 'update_brand') {
      await query(`UPDATE brands SET brand_name=$1 WHERE brand_id=$2`, [body.brand_name, body.brand_id])
      return NextResponse.json({ success:true, message:'Brand updated' })
    }
    if (action === 'delete_brand') {
      await query(`DELETE FROM brands WHERE brand_id=$1`, [body.brand_id])
      return NextResponse.json({ success:true, message:'Brand deleted' })
    }
    if (action === 'add_category') {
      const { rows:[c] } = await query(`INSERT INTO categories (brand_id, category_name) VALUES ($1,$2) RETURNING category_id, category_name`, [body.brand_id, body.category_name])
      return NextResponse.json({ success:true, message:'Category added', category:c })
    }
    if (action === 'update_category') {
      await query(`UPDATE categories SET category_name=$1, brand_id=$2 WHERE category_id=$3`, [body.category_name, body.brand_id, body.category_id])
      return NextResponse.json({ success:true, message:'Category updated' })
    }
    if (action === 'delete_category') {
      await query(`DELETE FROM categories WHERE category_id=$1`, [body.category_id])
      return NextResponse.json({ success:true, message:'Category deleted' })
    }
    if (action === 'add_sku') {
      await query(`INSERT INTO skus (category_id, sku_name, unit_of_measure, retail_price, is_active) VALUES ($1,$2,$3,$4,TRUE)`,
        [body.category_id, body.sku_name, body.unit_of_measure || 'CTN', body.retail_price || 0])
      return NextResponse.json({ success:true, message:'SKU added' })
    }
    if (action === 'update_sku') {
      await query(`UPDATE skus SET sku_name=$1, unit_of_measure=$2, retail_price=$3, category_id=$4 WHERE sku_id=$5`,
        [body.sku_name, body.unit_of_measure, body.retail_price, body.category_id, body.sku_id])
      return NextResponse.json({ success:true, message:'SKU updated' })
    }
    if (action === 'delete_sku') {
      await query(`UPDATE skus SET is_active=FALSE WHERE sku_id=$1`, [body.sku_id])
      return NextResponse.json({ success:true, message:'SKU deactivated' })
    }
    if (action === 'update_price') {
      await query(`UPDATE skus SET retail_price=$1 WHERE sku_id=$2`, [body.retail_price, body.sku_id])
      return NextResponse.json({ success:true, message:'Price updated' })
    }
    return NextResponse.json({ message:'Invalid action' }, { status:400 })
  } catch (err: unknown) { return NextResponse.json({ message:(err instanceof Error ? err.message : String(err)) }, { status:500 }) }
}