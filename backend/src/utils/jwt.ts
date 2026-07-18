import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'd5f0e34a6efc4b2289f81d11bb7a5e8c156fcf2252a1d82dbf06871a2a4b868e';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Signs a payload to generate a JWT token.
 * @param payload Object containing id, email, and role
 * @returns JWT token string
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Verifies a JWT token.
 * @param token JWT token string
 * @returns Decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}
