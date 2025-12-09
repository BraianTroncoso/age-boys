import type { APIRoute } from 'astro';
import { db } from '../../db';
import { isAdmin, hashPassword } from '../../lib/auth';

// POST: Solo admin puede crear jugadores invitados
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verificar que sea admin
    if (!isAdmin(locals.user)) {
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'El nombre debe tener al menos 2 caracteres' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar si ya existe un usuario con ese nombre
    const existingUser = await db.users.findByUsername(name.trim());
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: 'Ya existe un jugador con ese nombre' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Crear usuario invitado con password temporal
    const passwordHash = await hashPassword('guest123');
    const player = await db.users.create({
      username: name.trim(),
      passwordHash,
      favoriteCiv: 'spanish'
    });

    return new Response(JSON.stringify({ success: true, player }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create player error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

// GET: Obtener todos los jugadores (usuarios)
export const GET: APIRoute = async () => {
  try {
    const players = await db.users.findAll();
    return new Response(JSON.stringify({ success: true, players }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
