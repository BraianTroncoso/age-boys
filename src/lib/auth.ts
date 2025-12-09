import bcrypt from 'bcryptjs';
import { db } from '../db';

const SALT_ROUNDS = 10;
const SESSION_COOKIE = 'aoe3_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(username: string, password: string, favoriteCiv: string = 'spanish') {
  const passwordHash = await hashPassword(password);

  const existing = await db.users.findByUsername(username);
  if (existing) {
    return { success: false, error: 'El usuario ya existe' };
  }

  try {
    const user = await db.users.create({ username, passwordHash, favoriteCiv });
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: 'Error al crear usuario' };
  }
}

export function isAdmin(user: { username: string } | null): boolean {
  if (!user) return false;
  return user.username === 'admin';
}

export async function authenticateUser(username: string, password: string) {
  const user = await db.users.findByUsername(username);

  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return { success: false, error: 'Contraseña incorrecta' };
  }

  return { success: true, user };
}

export function createSession(userId: number): string {
  const sessionData = JSON.stringify({
    userId,
    createdAt: Date.now(),
  });
  return Buffer.from(sessionData).toString('base64');
}

export function parseSession(token: string): { userId: number; createdAt: number } | null {
  try {
    const sessionData = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function getSessionFromCookies(cookieHeader: string | null): { userId: number; createdAt: number } | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const sessionToken = cookies[SESSION_COOKIE];
  if (!sessionToken) return null;

  return parseSession(sessionToken);
}

export async function getUserFromSession(session: { userId: number } | null) {
  if (!session) return null;
  return await db.users.findById(session.userId) || null;
}

export { SESSION_COOKIE };
