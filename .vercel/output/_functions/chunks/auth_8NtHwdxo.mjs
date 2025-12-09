import bcrypt from 'bcryptjs';
import { d as db } from './index_Bw9JdCU_.mjs';

const SALT_ROUNDS = 10;
const SESSION_COOKIE = "aoe3_session";
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createUser(username, password, favoriteCiv = "spanish") {
  const passwordHash = await hashPassword(password);
  const existing = await db.users.findByUsername(username);
  if (existing) {
    return { success: false, error: "El usuario ya existe" };
  }
  try {
    const user = await db.users.create({ username, passwordHash, favoriteCiv });
    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Error al crear usuario" };
  }
}
function isAdmin(user) {
  if (!user) return false;
  return user.username === "admin";
}
async function authenticateUser(username, password) {
  const user = await db.users.findByUsername(username);
  if (!user) {
    return { success: false, error: "Usuario no encontrado" };
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Contraseña incorrecta" };
  }
  return { success: true, user };
}
function createSession(userId) {
  const sessionData = JSON.stringify({
    userId,
    createdAt: Date.now()
  });
  return Buffer.from(sessionData).toString("base64");
}
function parseSession(token) {
  try {
    const sessionData = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}
function getSessionFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});
  const sessionToken = cookies[SESSION_COOKIE];
  if (!sessionToken) return null;
  return parseSession(sessionToken);
}
async function getUserFromSession(session) {
  if (!session) return null;
  return await db.users.findById(session.userId) || null;
}

export { SESSION_COOKIE as S, getUserFromSession as a, authenticateUser as b, createSession as c, createUser as d, getSessionFromCookies as g, hashPassword as h, isAdmin as i };
