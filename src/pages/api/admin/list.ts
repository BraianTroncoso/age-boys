import type { APIRoute } from 'astro';
import { db } from '../../../db';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  try {
    // Obtener torneos
    const tournaments = await db.tournaments.findAll();

    // Obtener partidas recientes (últimas 50)
    const allMatches = await db.matches.findAll();
    const recentMatches = allMatches.slice(0, 50);

    // Enriquecer partidas con participantes
    const matchesWithParticipants = [];
    for (const match of recentMatches) {
      const participants = await db.participants.findByMatchId(match.id);
      const enrichedParticipants = [];

      for (const p of participants) {
        const player = await db.users.findById(p.playerId);
        enrichedParticipants.push({
          ...p,
          playerName: player?.username || 'Desconocido'
        });
      }

      matchesWithParticipants.push({
        ...match,
        participants: enrichedParticipants
      });
    }

    return new Response(JSON.stringify({
      tournaments,
      matches: matchesWithParticipants
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener datos' }), { status: 500 });
  }
};
