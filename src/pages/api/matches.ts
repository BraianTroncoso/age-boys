import type { APIRoute } from 'astro';
import { db } from '../../db';
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
      if (!db.players.findById(p.playerId)) {
        return new Response(JSON.stringify({ success: false, error: `Jugador con ID ${p.playerId} no encontrado` }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Create match
    const match = db.matches.create({ matchType, createdBy: locals.user?.id });
    const eloChanges: Map<number, number> = new Map();

    if (matchType === '1v1') {
      const winner = participants.find(p => p.isWinner)!;
      const loser = participants.find(p => !p.isWinner)!;
      const winnerPlayer = db.players.findById(winner.playerId)!;
      const loserPlayer = db.players.findById(loser.playerId)!;

      const { winnerChange, loserChange } = calculate1v1Elo(winnerPlayer.eloRating, loserPlayer.eloRating);
      eloChanges.set(winner.playerId, winnerChange);
      eloChanges.set(loser.playerId, loserChange);

      db.players.update(winner.playerId, { eloRating: winnerPlayer.eloRating + winnerChange });
      db.players.update(loser.playerId, { eloRating: loserPlayer.eloRating + loserChange });

    } else if (['2v2', '3v3', '4v4'].includes(matchType)) {
      const winners = participants.filter(p => p.isWinner);
      const losers = participants.filter(p => !p.isWinner);

      const winnerRatings = winners.map(w => db.players.findById(w.playerId)!.eloTeams);
      const loserRatings = losers.map(l => db.players.findById(l.playerId)!.eloTeams);

      const { winnerChanges, loserChanges } = calculateTeamElo(winnerRatings, loserRatings);

      winners.forEach((w, i) => {
        eloChanges.set(w.playerId, winnerChanges[i]);
        const player = db.players.findById(w.playerId)!;
        db.players.update(w.playerId, { eloTeams: player.eloTeams + winnerChanges[i] });
      });

      losers.forEach((l, i) => {
        eloChanges.set(l.playerId, loserChanges[i]);
        const player = db.players.findById(l.playerId)!;
        db.players.update(l.playerId, { eloTeams: player.eloTeams + loserChanges[i] });
      });

    } else if (matchType === 'ffa') {
      const winner = participants.find(p => p.isWinner)!;
      const losers = participants.filter(p => !p.isWinner);
      const winnerPlayer = db.players.findById(winner.playerId)!;
      const loserRatings = losers.map(l => db.players.findById(l.playerId)!.eloFfa);

      const { winnerChange, loserChanges } = calculateFfaElo(winnerPlayer.eloFfa, loserRatings);

      eloChanges.set(winner.playerId, winnerChange);
      db.players.update(winner.playerId, { eloFfa: winnerPlayer.eloFfa + winnerChange });

      losers.forEach((l, i) => {
        eloChanges.set(l.playerId, loserChanges[i]);
        const player = db.players.findById(l.playerId)!;
        db.players.update(l.playerId, { eloFfa: player.eloFfa + loserChanges[i] });
      });
    }

    // Insert participants
    for (const p of participants) {
      db.participants.create({
        matchId: match.id,
        playerId: p.playerId,
        team: p.team,
        civilization: p.civilization,
        isWinner: p.isWinner,
        eloChange: eloChanges.get(p.playerId) || 0,
      });
    }

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
