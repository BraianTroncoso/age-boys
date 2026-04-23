import type { APIRoute } from 'astro';
import { createSessionCookie, SESSION_COOKIE } from '../../../lib/auth';
import { adminAuth } from '../../../lib/firebase/admin';
import { db } from '../../../db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { idToken, username, favoriteCiv } = await request.json();

    if (!idToken || !username) {
      return new Response(JSON.stringify({ success: false, error: 'Token y username requeridos' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (username.length < 3 || username.length > 20) {
      return new Response(JSON.stringify({ success: false, error: 'El usuario debe tener entre 3 y 20 caracteres' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await db.users.findByUsername(username);
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'El nombre de usuario ya existe' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    await db.users.create({
      id: decoded.uid,
      username,
      email: decoded.email,
      favoriteCiv: favoriteCiv || 'spanish',
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE}=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=432000`,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
