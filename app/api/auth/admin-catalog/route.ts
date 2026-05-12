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
    const url = new URL(request.url)
    const storeId = url.searchParams.get('store_id')
    if (storeId) {
      const { rows: storePricing } = await query(`
     SELECT sp.pricing_id, sp.store_id, sp.sku_id, sp.pct_to_mrp, sp.pct_to_trade,
               sp.trade_price, sp.invoice_price, sp.mrp_inc_gst,
               sk.sku_name, sk.retail_price, b.brand_name, c.category_name
        FROM store_pricing sp
        JOIN skus sk ON sk.sku_id = sp.sku_id
        JOIN categories c ON c.category_id = sk.category_id
        JOIN brands b ON b.brand_id = c.brand_id
        WHERE sp.store_id = $1
        ORDER BY b.brand_name, sk.sku_name
      `, [storeId])
      return NextResponse.json({ brands, categories, skus, storePricing })
    }
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
    if (action === 'save_store_pricing') {
const { store_id, sku_id, pct_to_mrp, pct_to_trade } = body
// Get retail_price from SKU table
const { rows: skuRows } = await query(`SELECT retail_price FROM skus WHERE sku_id=$1`, [sku_id])
const mrp = parseFloat(skuRows[0].retail_price)
const p1 = parseFloat(pct_to_mrp) / 100
const p2 = parseFloat(pct_to_trade) / 100
const mrpExc = mrp * 100 / 118
const gst = mrp * 18 / 118
const tradeExc = mrpExc - (mrpExc * p1)
const trade_price = tradeExc + gst
const invExc = tradeExc - (tradeExc * p2)
const invoice_price = invExc + gst

      // const { store_id, sku_id, pct_to_mrp, pct_to_trade, mrp_inc_gst } = body
      // const p1 = parseFloat(pct_to_mrp) / 100
      // const p2 = parseFloat(pct_to_trade) / 100
      // const mrp = parseFloat(mrp_inc_gst)
      // const mrpExc = mrp * 100 / 118
      // const gst = mrp * 18 / 118
      // const tradeExc = mrpExc - (mrpExc * p1)
      // const trade_price = tradeExc + gst
      // const invExc = tradeExc - (tradeExc * p2)
      // const invoice_price = invExc + gst
// if (action === 'save_store_pricing') {
//       const { store_id, sku_id, pct_to_mrp, pct_to_trade, mrp_inc_gst } = body
//       const p1 = parseFloat(pct_to_mrp) / 100
//       const p2 = parseFloat(pct_to_trade) / 100
//       const mrp = parseFloat(mrp_inc_gst)
//       const trade_price = mrp - (mrp * p1)
//       const invoice_price = trade_price - (trade_price * p2)


    //   await query(`
    //     INSERT INTO store_pricing (store_id, sku_id, pct_to_mrp, pct_to_trade, mrp_inc_gst, trade_price, invoice_price, effective_from)
    //     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
    //     ON CONFLICT (store_id, sku_id, effective_from) DO UPDATE SET
    //       pct_to_mrp=$3, pct_to_trade=$4, mrp_inc_gst=$5, trade_price=$6, invoice_price=$7
    //   `, [store_id, sku_id, pct_to_mrp, pct_to_trade, mrp_inc_gst, trade_price, invoice_price])
    //   return NextResponse.json({ success:true, message:'Store pricing saved', trade_price, invoice_price })
    // }

      await query(`
        INSERT INTO store_pricing (store_id, sku_id, pct_to_mrp, pct_to_trade, mrp_inc_gst, trade_price, invoice_price, effective_from)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
ON CONFLICT (store_id, sku_id, effective_from) DO UPDATE SET
  pct_to_mrp=$3, pct_to_trade=$4, mrp_inc_gst=$5, trade_price=$6, invoice_price=$7
`, [store_id, sku_id, pct_to_mrp, pct_to_trade, mrp, trade_price, invoice_price])
    }
    if (action === 'delete_store_pricing') {
      await query(`DELETE FROM store_pricing WHERE pricing_id=$1`, [body.pricing_id])
      return NextResponse.json({ success:true, message:'Pricing deleted' })
    }
    return NextResponse.json({ message:'Invalid action' }, { status:400 })
  } catch (err: unknown) { return NextResponse.json({ message:(err instanceof Error ? err.message : String(err)) }, { status:500 }) }
}