import type { APIRoute } from 'astro';
import { authenticateUser, createSession, SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Usuario y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await authenticateUser(username, password);

    if (!result.success || !result.user) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 401,
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
    console.error('Login error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
