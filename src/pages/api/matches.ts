import type { APIRoute } from 'astro';
import { db, invalidateCache } from '../../db';
import { calculate1v1Elo, calculateTeamElo, calculateFfaElo } from '../../lib/elo';

interface Participant {
  playerId: number;
  civilization: string;
  team: number | null;
  isWinner: boolean;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { matchType, participants } = body as { matchType: string; participants: Participant[] };

    if (!matchType || !participants || participants.length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'Datos de partida incompletos' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate all players exist
    for (const p of participants) {
      const user = await db.users.findById(p.playerId);
      if (!user) {
        return new Response(JSON.stringify({ success: false, error: `Jugador con ID ${p.playerId} no encontrado` }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Create match
    const match = await db.matches.create({ matchType, createdBy: locals.user?.id });
    const eloChanges: Map<number, number> = new Map();

    if (matchType === '1v1') {
      const winner = participants.find(p => p.isWinner)!;
      const loser = participants.find(p => !p.isWinner)!;
      const winnerPlayer = await db.users.findById(winner.playerId);
      const loserPlayer = await db.users.findById(loser.playerId);

      if (!winnerPlayer || !loserPlayer) {
        return new Response(JSON.stringify({ success: false, error: 'Jugadores no encontrados' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      const { winnerChange, loserChange } = calculate1v1Elo(winnerPlayer.eloRating, loserPlayer.eloRating);
      eloChanges.set(winner.playerId, winnerChange);
      eloChanges.set(loser.playerId, loserChange);

      await db.users.update(winner.playerId, { eloRating: winnerPlayer.eloRating + winnerChange });
      await db.users.update(loser.playerId, { eloRating: loserPlayer.eloRating + loserChange });

    } else if (['2v2', '3v3', '4v4'].includes(matchType)) {
      const winners = participants.filter(p => p.isWinner);
      const losers = participants.filter(p => !p.isWinner);

      const winnerRatings: number[] = [];
      const loserRatings: number[] = [];

      for (const w of winners) {
        const player = await db.users.findById(w.playerId);
        if (player) winnerRatings.push(player.eloTeams);
      }

      for (const l of losers) {
        const player = await db.users.findById(l.playerId);
        if (player) loserRatings.push(player.eloTeams);
      }

      const { winnerChanges, loserChanges } = calculateTeamElo(winnerRatings, loserRatings);

      for (let i = 0; i < winners.length; i++) {
        eloChanges.set(winners[i].playerId, winnerChanges[i]);
        const player = await db.users.findById(winners[i].playerId);
        if (player) {
          await db.users.update(winners[i].playerId, { eloTeams: player.eloTeams + winnerChanges[i] });
        }
      }

      for (let i = 0; i < losers.length; i++) {
        eloChanges.set(losers[i].playerId, loserChanges[i]);
        const player = await db.users.findById(losers[i].playerId);
        if (player) {
          await db.users.update(losers[i].playerId, { eloTeams: player.eloTeams + loserChanges[i] });
        }
      }

    } else if (matchType === 'ffa') {
      const winner = participants.find(p => p.isWinner)!;
      const losers = participants.filter(p => !p.isWinner);
      const winnerPlayer = await db.users.findById(winner.playerId);

      if (!winnerPlayer) {
        return new Response(JSON.stringify({ success: false, error: 'Ganador no encontrado' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      const loserRatings: number[] = [];
      for (const l of losers) {
        const player = await db.users.findById(l.playerId);
        if (player) loserRatings.push(player.eloFfa);
      }

      const { winnerChange, loserChanges } = calculateFfaElo(winnerPlayer.eloFfa, loserRatings);

      eloChanges.set(winner.playerId, winnerChange);
      await db.users.update(winner.playerId, { eloFfa: winnerPlayer.eloFfa + winnerChange });

      for (let i = 0; i < losers.length; i++) {
        eloChanges.set(losers[i].playerId, loserChanges[i]);
        const player = await db.users.findById(losers[i].playerId);
        if (player) {
          await db.users.update(losers[i].playerId, { eloFfa: player.eloFfa + loserChanges[i] });
        }
      }
    }

    // Insert participants
    for (const p of participants) {
      await db.participants.create({
        matchId: match.id,
        playerId: p.playerId,
        team: p.team,
        civilization: p.civilization,
        isWinner: p.isWinner,
        eloChange: eloChanges.get(p.playerId) || 0,
      });
    }

    // Invalidar cache después de crear partida
    invalidateCache();

    return new Response(JSON.stringify({ success: true, match }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create match error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error del servidor' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
