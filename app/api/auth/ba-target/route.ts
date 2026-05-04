import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const employeeId = user.employeeId
  if (!employeeId) return NextResponse.json({ message: 'No employee record' }, { status: 400 })

  try {
    const now = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()
    const totalDays    = new Date(year, month, 0).getDate()
    const daysPassed   = now.getDate()
    const daysLeft     = totalDays - daysPassed

    // Get store target for this month
    const { rows: targetRows } = await query(`
      SELECT smt.target_amount, s.store_name, e.fixed_salary
      FROM employee_store_assignments esa
      JOIN stores s ON esa.store_id = s.store_id
      JOIN store_monthly_targets smt ON smt.store_id = s.store_id AND smt.month = $2 AND smt.year = $3
      JOIN gm_employees e ON e.employee_id = $1
      WHERE esa.employee_id = $1 AND esa.is_active = TRUE
      LIMIT 1
    `, [employeeId, month, year])

    // MTD sales (this month only)
    const { rows: mtdRows } = await query(`
      SELECT COALESCE(SUM(si.total_amount), 0) AS mtd_sales
      FROM sales_entries se
      JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      WHERE se.employee_id = $1
        AND se.sales_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND se.sales_date <= CURRENT_DATE
    `, [employeeId])

    // Today's sales (based on check-in/check-out)
    const { rows: todayRows } = await query(`
      SELECT COALESCE(SUM(si.total_amount), 0) AS today_sales
      FROM sales_entries se
      JOIN sales_entry_items si ON si.sales_entry_id = se.sales_entry_id
      WHERE se.employee_id = $1 AND se.sales_date = CURRENT_DATE
    `, [employeeId])

    // Get incentive slabs
    const { rows: slabs } = await query(`
      SELECT slab_order, threshold_pct, incentive_pct
      FROM incentive_slabs ORDER BY slab_order ASC
    `, [])

    const target      = Number(targetRows[0]?.target_amount || 0)
    const mtdSales    = Number(mtdRows[0]?.mtd_sales || 0)
    const todaySales  = Number(todayRows[0]?.today_sales || 0)
    const fixedSalary = Number(targetRows[0]?.fixed_salary || 0)
    const storeName   = targetRows[0]?.store_name || ''

    // Calculate which slab BA is in and incentive earned
    let incentiveEarned  = 0
    let currentSlabIdx   = -1  // -1 = base (no incentive yet)
    let nextSlabTarget   = target
    let currentSlabLabel = 'Base Target'
    let nextSlabLabel    = ''
    let nextSlabIncentive = 0

    if (target > 0 && slabs.length > 0 && mtdSales >= target) {
      let slabBase = target
      for (let i = 0; i < slabs.length; i++) {
        const slabThreshold = slabBase * (1 + slabs[i].threshold_pct / 100)
        if (mtdSales >= slabThreshold || i === slabs.length - 1) {
          // In this slab or beyond
          if (mtdSales >= slabThreshold) {
            incentiveEarned  = slabThreshold * (slabs[i].incentive_pct / 100)
            currentSlabIdx   = i
            currentSlabLabel = `Slab ${i + 1}`
            slabBase = slabThreshold
            if (i < slabs.length - 1) {
              nextSlabTarget   = slabBase * (1 + slabs[i+1].threshold_pct / 100)
              nextSlabLabel    = `Slab ${i + 2}`
              nextSlabIncentive = nextSlabTarget * (slabs[i+1].incentive_pct / 100)
            }
          } else {
            // In between slabs
            incentiveEarned   = slabBase > target ? slabBase * (slabs[i > 0 ? i-1 : 0].incentive_pct / 100) : 0
            currentSlabIdx    = i - 1
            currentSlabLabel  = i > 0 ? `Slab ${i}` : 'Base Target Hit'
            nextSlabTarget    = slabThreshold
            nextSlabLabel     = `Slab ${i + 1}`
            nextSlabIncentive = slabThreshold * (slabs[i].incentive_pct / 100)
            break
          }
        } else {
          nextSlabTarget    = slabThreshold
          nextSlabLabel     = `Slab ${i + 1}`
          nextSlabIncentive = slabThreshold * (slabs[i].incentive_pct / 100)
          break
        }
      }
    } else if (target > 0 && slabs.length > 0) {
      // Not hit base target yet
      const firstSlab = target * (1 + slabs[0].threshold_pct / 100)
      nextSlabTarget    = firstSlab
      nextSlabLabel     = 'Slab 1'
      nextSlabIncentive = firstSlab * (slabs[0].incentive_pct / 100)
    }

    const remaining         = Math.max(0, target - mtdSales)
    const perDayNeeded      = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : 0
    const pct               = target > 0 ? Math.min(100, Math.round((mtdSales / target) * 100)) : 0
    const nextSlabRemaining = Math.max(0, nextSlabTarget - mtdSales)
    const nextSlabPct       = nextSlabTarget > 0 ? Math.min(100, Math.round((mtdSales / nextSlabTarget) * 100)) : 0
    const totalPay          = fixedSalary + incentiveEarned

    return NextResponse.json({
      target, mtdSales, todaySales, fixedSalary, storeName,
      remaining, perDayNeeded, pct, daysLeft, daysPassed, totalDays,
      incentiveEarned, totalPay, currentSlabIdx, currentSlabLabel,
      nextSlabTarget, nextSlabLabel, nextSlabIncentive, nextSlabRemaining, nextSlabPct,
      slabs, month, year,
      targetHit: mtdSales >= target,
    })
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
