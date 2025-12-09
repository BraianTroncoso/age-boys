import type { APIRoute } from 'astro';
import { createUser, createSession, SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password, favoriteCiv } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Usuario y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (username.length < 3 || username.length > 20) {
      return new Response(JSON.stringify({ success: false, error: 'El usuario debe tener entre 3 y 20 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 4) {
      return new Response(JSON.stringify({ success: false, error: 'La contraseña debe tener al menos 4 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await createUser(username, password, favoriteCiv || 'spanish');

    if (!result.success || !result.user) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionToken = createSession(result.user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
