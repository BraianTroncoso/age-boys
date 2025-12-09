import type { APIRoute } from 'astro';
import { db } from '../../db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { favoriteCiv } = body;

    if (!favoriteCiv) {
      return new Response(JSON.stringify({ success: false, error: 'Civilizacion requerida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.users.update(user.id, { favoriteCiv });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
