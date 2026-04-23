import type { APIRoute } from 'astro';
import { createSessionCookie, SESSION_COOKIE } from '../../../lib/auth';
import { adminAuth } from '../../../lib/firebase/admin';
import { db } from '../../../db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return new Response(JSON.stringify({ success: false, error: 'Token requerido' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    let user = await db.users.findById(decoded.uid);
    let isNewUser = false;

    if (!user) {
      await db.users.create({
        id: decoded.uid,
        username: decoded.name || decoded.email?.split('@')[0] || 'Jugador',
        email: decoded.email,
        favoriteCiv: 'spanish',
      });
      isNewUser = true;
    }

    return new Response(JSON.stringify({ success: true, isNewUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE}=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=432000`,
      },
    });
  } catch (error: any) {
    console.error('Session error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error al crear sesión' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
