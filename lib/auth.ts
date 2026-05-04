import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JwtPayload, Role } from '@/types';

const SECRET = process.env.JWT_SECRET as string;

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  try {
    const token = request.cookies.get('gmpl_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch (_e: unknown) {
    return null;
  }
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export function hasRole(user: JwtPayload | null, ...roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}
