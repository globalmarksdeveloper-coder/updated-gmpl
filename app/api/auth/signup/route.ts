import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, role, cnic, fatherName, address, bankName, bankAccount, iban } = body

    const full_name = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim()
    const cleanPhone = (phone || '').replace(/[\s\-]/g, '')

    // Basic validations
    if (!firstName?.trim()) return NextResponse.json({ message: 'First name is required' }, { status: 400 })
    if (!password) return NextResponse.json({ message: 'Password is required' }, { status: 400 })
    if (!cleanPhone || !/^03\d{9}$/.test(cleanPhone)) return NextResponse.json({ message: 'Phone must be 11 digits starting with 03' }, { status: 400 })

    // Role ID mapping
    const roleMap: Record<string, number> = { admin: 1, am: 2, tse: 3, ba: 4 }
    const role_id = roleMap[role]
    if (!role_id) return NextResponse.json({ message: 'Invalid role' }, { status: 400 })

    // BA validations
    if (role === 'ba') {
      if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) return NextResponse.json({ message: 'CNIC format: 12345-1234567-1' }, { status: 400 })
      if (!fatherName?.trim()) return NextResponse.json({ message: 'Father/Husband name is required' }, { status: 400 })
      if (!bankName) return NextResponse.json({ message: 'Bank name is required' }, { status: 400 })
      if (!bankAccount && !iban) return NextResponse.json({ message: 'Bank account or IBAN is required' }, { status: 400 })
    }

    // Duplicate checks — personal details must be unique
    const { rows: ph } = await query(`SELECT user_id FROM gm_users WHERE phone = $1`, [cleanPhone])
    if (ph.length) return NextResponse.json({
      message: `Phone number ${cleanPhone} is already registered to another account. Use a different number or login instead.`,
      field: 'phone',
    }, { status: 409 })

    if (email?.trim()) {
      const { rows: em } = await query(`SELECT user_id FROM gm_users WHERE LOWER(email) = LOWER($1)`, [email.trim()])
      if (em.length) return NextResponse.json({
        message: `Email ${email.trim()} is already registered. Try logging in or use a different email.`,
        field: 'email',
      }, { status: 409 })
    }

    if (cnic) {
      const { rows: cn } = await query(`SELECT user_id FROM gm_users WHERE cnic = $1`, [cnic])
      if (cn.length) return NextResponse.json({
        message: `CNIC ${cnic} is already registered. Each CNIC can only be used once.`,
        field: 'cnic',
      }, { status: 409 })
    }

    if (bankAccount) {
      const { rows: ba } = await query(`SELECT user_id FROM gm_users WHERE bank_account = $1`, [bankAccount])
      if (ba.length) return NextResponse.json({
        message: 'This bank account number is already linked to another account.',
        field: 'bank_account',
      }, { status: 409 })
    }

    if (iban) {
      const { rows: ib } = await query(`SELECT user_id FROM gm_users WHERE iban = $1`, [iban])
      if (ib.length) return NextResponse.json({
        message: 'This IBAN is already linked to another account.',
        field: 'iban',
      }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)

    const { rows: [u] } = await query(`
      INSERT INTO gm_users (full_name, email, phone, password_hash, role_id, is_active, cnic, father_name, address, bank_name, bank_account, iban)
      VALUES ($1,$2,$3,$4,$5,FALSE,$6,$7,$8,$9,$10,$11) RETURNING user_id
    `, [full_name, email?.trim() || null, cleanPhone, hash, role_id, cnic || null, fatherName?.trim() || null, address?.trim() || null, bankName || null, bankAccount || null, iban || null])

    await query(`
      INSERT INTO gm_employees (user_id, role_id, phone, status, joining_date)
      VALUES ($1,$2,$3,'active',CURRENT_DATE)
    `, [u.user_id, role_id, cleanPhone])

    return NextResponse.json({ success: true, message: 'Account request submitted. Admin will review within 24 hours.' })
  } catch (err: unknown) {
    console.error('Signup error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
