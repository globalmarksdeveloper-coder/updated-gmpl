import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const ROLE_MAP = {
  admin: 'Admin',
  am:    'Area Manager',
  tsc:   'TSC',
  ba:    'Brand Ambassador',
}

const ROLE_REDIRECTS = {
  admin: '/admin/dashboard',
  am:    '/am/dashboard',
  tsc:   '/tsc/dashboard',
  ba:    '/ba/dashboard',
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json() as { email: string; password: string; role: string }

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Email, password and role are required' }, { status: 400 })
    }

    const roleName = ROLE_MAP[role as keyof typeof ROLE_MAP]
    if (!roleName) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    // Query gm_users joined with roles
    const { rows } = await query(`
      SELECT
        u.user_id, u.full_name, u.email, u.password_hash,
        u.is_active, u.user_code,
        r.role_id, r.role_name,
        e.employee_id, e.employee_code
      FROM gm_users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN gm_employees e ON e.user_id = u.user_id
      WHERE u.email = $1 AND LOWER(r.role_name) = LOWER($2)
    `, [email, roleName])

    const user = rows[0]

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ message: 'Account is deactivated. Contact admin.' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const token = jwt.sign(
      {
        userId:       user.user_id,
        userCode:     user.user_code,
        employeeId:   user.employee_id,
        employeeCode: user.employee_code,
        email:        user.email,
        fullName:     user.full_name,
        role:         role,
        roleName:     user.role_name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message:  'Login successful',
      role:     role,
      redirect: ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS] || '/ba/dashboard',
    })

    // response.cookies.set('gmpl_token', token, {
    //   httpOnly: true,
    //   secure:   process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge:   60 * 60 * 24 * 7,
    //   path:     '/',
    // })


    response.cookies.set('gmpl_token', token, {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
})

    return response

  } catch (err: unknown) {
    console.error('Login error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 })
  }
}




