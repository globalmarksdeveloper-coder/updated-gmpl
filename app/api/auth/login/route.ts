import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const ROLE_MAP: Record<string, string> = {
  admin: 'Admin',
  am:    'Area Manager',
  tse:   'TSE/TSO',
  ba:    'Brand Ambassador',
}

const ROLE_REDIRECTS: Record<string, string> = {
  admin: '/admin/dashboard',
  am:    '/am/dashboard',
  tse:   '/tse/dashboard',
  ba:    '/ba/dashboard',
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json() as { email: string; password: string; role: string }

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Email, password and role are required' }, { status: 400 })
    }

    const roleName = ROLE_MAP[role]
    if (!roleName) {
      return NextResponse.json({ message: 'Invalid role selected' }, { status: 400 })
    }

    // Step 1: Check if the email exists at all (any role)
    const { rows: emailCheck } = await query(
      `SELECT u.user_id FROM gm_users u WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    )

    if (emailCheck.length === 0) {
      return NextResponse.json({
        message: 'No account found with this email address. Please check your email or sign up.',
        field: 'email',
      }, { status: 401 })
    }

    // Step 2: Check if the email exists with the selected role
    const { rows } = await query(`
      SELECT
        u.user_id, u.full_name, u.email, u.password_hash,
        u.is_active, u.user_code,
        r.role_id, r.role_name,
        e.employee_id, e.employee_code
      FROM gm_users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN gm_employees e ON e.user_id = u.user_id
      WHERE LOWER(u.email) = LOWER($1) AND LOWER(r.role_name) = LOWER($2)
    `, [email.trim(), roleName])

    if (rows.length === 0) {
      // Email exists but not for this role
      return NextResponse.json({
        message: `This email is not registered as a ${roleName}. Please select the correct role.`,
        field: 'role',
      }, { status: 401 })
    }

    const user = rows[0]

    if (!user.is_active) {
      return NextResponse.json({
        message: 'Your account is pending admin approval. Please contact your admin.',
        field: 'account',
      }, { status: 403 })
    }

    // Step 3: Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({
        message: 'Incorrect password. Please try again.',
        field: 'password',
      }, { status: 401 })
    }

    const token = jwt.sign(
      {
        userId:       user.user_id,
        userCode:     user.user_code || '',
        employeeId:   user.employee_id,
        employeeCode: user.employee_code || '',
        email:        user.email,
        fullName:     user.full_name,
        role,
        roleName:     user.role_name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message:  'Login successful',
      role,
      redirect: ROLE_REDIRECTS[role] || '/ba/dashboard',
    })

    response.cookies.set('gmpl_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return response

  } catch (err: unknown) {
    console.error('Login error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 })
  }
}
