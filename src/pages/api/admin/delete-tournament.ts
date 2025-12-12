import type { APIRoute } from 'astro';
import { db } from '../../../db';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  try {
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return new Response(JSON.stringify({ error: 'tournamentId requerido' }), { status: 400 });
    }

    // 1. Obtener torneo
    const tournament = await db.tournaments.findById(tournamentId);
    if (!tournament) {
      return new Response(JSON.stringify({ error: 'Torneo no encontrado' }), { status: 404 });
    }

    // 2. Si el torneo afectaba ELO, revertir todas las partidas
    if (tournament.affectsElo) {
      const tournamentMatches = await db.tournamentMatches.findByTournamentId(tournamentId);

      for (const tm of tournamentMatches) {
        if (tm.matchId) {
          // Obtener participantes de esta partida
          const participants = await db.participants.findByMatchId(tm.matchId);

          // Revertir ELO de cada participante (torneos siempre usan eloRating)
          for (const p of participants) {
            const player = await db.users.findById(p.playerId);
            if (!player) continue;

            const newElo = player.eloRating - p.eloChange;
            await db.users.update(p.playerId, { eloRating: newElo });
          }

          // Eliminar partida
          await db.matches.delete(tm.matchId);
        }
      }
    }

    // 3. Eliminar torneo (y tournament_matches en cascada)
    await db.tournaments.delete(tournamentId);

    return new Response(JSON.stringify({
      success: true,
      message: `Torneo "${tournament.name}" eliminado${tournament.affectsElo ? ' y ELO revertido' : ''}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar torneo' }), { status: 500 });
  }
};
