import { adminAuth } from './firebase/admin';
import { db } from '../db';

const SESSION_COOKIE = '__session';
const SESSION_EXPIRES = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES });
}

export async function verifySession(cookie: string) {
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie);
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserFromSession(cookie: string | undefined | null) {
  if (!cookie) return null;
  const decoded = await verifySession(cookie);
  if (!decoded) return null;
  return await db.users.findById(decoded.uid) || null;
}

export function isAdmin(user: { isAdmin: boolean } | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.isAdmin);
}

export { SESSION_COOKIE };
