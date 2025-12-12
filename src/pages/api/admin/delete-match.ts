import type { APIRoute } from 'astro';
import { db } from '../../../db';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return new Response(JSON.stringify({ error: 'matchId requerido' }), { status: 400 });
    }

    // 1. Obtener partida y participantes
    const match = await db.matches.findById(matchId);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Partida no encontrada' }), { status: 404 });
    }

    const participants = await db.participants.findByMatchId(matchId);

    // 2. Revertir ELO de cada participante
    for (const p of participants) {
      const player = await db.users.findById(p.playerId);
      if (!player) continue;

      // Determinar qué tipo de ELO revertir según matchType
      let eloField: 'eloRating' | 'eloTeams' | 'eloFfa';
      if (match.matchType === '1v1') {
        eloField = 'eloRating';
      } else if (match.matchType === 'ffa') {
        eloField = 'eloFfa';
      } else {
        eloField = 'eloTeams';
      }

      const currentElo = player[eloField];
      const newElo = currentElo - p.eloChange; // Restar el cambio

      await db.users.update(p.playerId, { [eloField]: newElo });
    }

    // 3. Eliminar partida (y participantes en cascada)
    await db.matches.delete(matchId);

    return new Response(JSON.stringify({
      success: true,
      message: `Partida #${matchId} eliminada y ELO revertido`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar partida' }), { status: 500 });
  }
};
