import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { calculate1v1Elo } from '../../../../lib/elo';
import { getNextMatchSlot, getDoubleEliminationNextSlot, isTournamentComplete, getTournamentWinner } from '../../../../lib/tournaments';

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const tournamentId = parseInt(params.id || '0');
    const body = await request.json();
    const { tournamentMatchId, winnerId } = body as {
      tournamentMatchId: number;
      winnerId: number;
    };

    // Validate tournament exists
    const tournament = await db.tournaments.findById(tournamentId);
    if (!tournament) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Torneo no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (tournament.status !== 'active') {
      return new Response(JSON.stringify({
        success: false,
        error: 'El torneo no está activo'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate tournament match exists
    const tournamentMatch = await db.tournamentMatches.findById(tournamentMatchId);
    if (!tournamentMatch || tournamentMatch.tournamentId !== tournamentId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Partido del torneo no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check match hasn't been played
    if (tournamentMatch.winnerId !== null) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Este partido ya fue jugado'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check both players are assigned
    if (tournamentMatch.player1Id === null || tournamentMatch.player2Id === null) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El partido aún no tiene ambos jugadores asignados'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate winner is one of the players
    if (winnerId !== tournamentMatch.player1Id && winnerId !== tournamentMatch.player2Id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El ganador debe ser uno de los jugadores del partido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const loserId = winnerId === tournamentMatch.player1Id
      ? tournamentMatch.player2Id
      : tournamentMatch.player1Id;

    // Get player data
    const winner = await db.users.findById(winnerId);
    const loser = await db.users.findById(loserId);

    if (!winner || !loser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Jugadores no encontrados'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate ELO changes (only if tournament affects ELO)
    let winnerChange = 0;
    let loserChange = 0;

    if (tournament.affectsElo) {
      const eloResult = calculate1v1Elo(winner.eloRating, loser.eloRating);
      winnerChange = eloResult.winnerChange;
      loserChange = eloResult.loserChange;
    }

    // Create match in main matches table
    const match = await db.matches.create({
      matchType: tournament.affectsElo ? 'tournament' : 'tournament_casual',
      createdBy: locals.user?.id
    });

    // Create participants
    await db.participants.create({
      matchId: match.id,
      playerId: winnerId,
      team: 1,
      civilization: winner.favoriteCiv,
      isWinner: true,
      eloChange: winnerChange
    });

    await db.participants.create({
      matchId: match.id,
      playerId: loserId,
      team: 2,
      civilization: loser.favoriteCiv,
      isWinner: false,
      eloChange: loserChange
    });

    // Update player ELO ratings (only if tournament affects ELO)
    if (tournament.affectsElo) {
      await db.users.update(winnerId, {
        eloRating: winner.eloRating + winnerChange
      });
      await db.users.update(loserId, {
        eloRating: loser.eloRating + loserChange
      });
    }

    // Update tournament match
    await db.tournamentMatches.update(tournamentMatchId, {
      winnerId,
      matchId: match.id,
      playedAt: new Date().toISOString()
    });

    // Handle advancement based on bracket type
    if (tournament.bracketType === 'double') {
      // DOUBLE ELIMINATION
      // Advance winner
      const winnerNextSlot = getDoubleEliminationNextSlot(tournamentMatch, true, tournament.size);
      if (winnerNextSlot) {
        const nextMatch = await db.tournamentMatches.findByRoundAndPosition(
          tournamentId,
          winnerNextSlot.nextRound,
          winnerNextSlot.nextPosition,
          winnerNextSlot.bracket
        );

        if (nextMatch) {
          await db.tournamentMatches.update(nextMatch.id, {
            [winnerNextSlot.slot]: winnerId
          });
        }
      }

      // Handle loser (drop to losers bracket or eliminate)
      if (tournamentMatch.bracket === 'winners') {
        // Loser drops to losers bracket
        const loserNextSlot = getDoubleEliminationNextSlot(tournamentMatch, false, tournament.size);
        if (loserNextSlot) {
          const losersMatch = await db.tournamentMatches.findByRoundAndPosition(
            tournamentId,
            loserNextSlot.nextRound,
            loserNextSlot.nextPosition,
            loserNextSlot.bracket
          );

          if (losersMatch) {
            await db.tournamentMatches.update(losersMatch.id, {
              [loserNextSlot.slot]: loserId
            });
          }
        }
      }
      // In losers bracket, loser is eliminated (no advancement needed)

      // Special handling for Grand Final
      if (tournamentMatch.bracket === 'grand_final') {
        // If winners bracket champion won, tournament is over
        if (winnerId === tournamentMatch.player1Id) {
          // Winners champion won - tournament complete
        } else {
          // Losers champion won - check if bracket reset is enabled
          if (tournament.bracketReset) {
            // Set up Final Reset match
            const finalResetMatch = await db.tournamentMatches.findByRoundAndPosition(
              tournamentId,
              1,
              0,
              'final_reset'
            );

            if (finalResetMatch) {
              await db.tournamentMatches.update(finalResetMatch.id, {
                player1Id: tournamentMatch.player1Id, // Former winners champion
                player2Id: winnerId // Losers champion who just won
              });
            }
          }
          // If bracketReset is false, losers champion is the winner (tournament complete)
        }
      }
    } else {
      // SINGLE ELIMINATION
      const nextSlot = getNextMatchSlot(tournamentMatch.round, tournamentMatch.position);
      if (nextSlot) {
        const nextMatch = await db.tournamentMatches.findByRoundAndPosition(
          tournamentId,
          nextSlot.nextRound,
          nextSlot.nextPosition,
          'winners'
        );

        if (nextMatch) {
          await db.tournamentMatches.update(nextMatch.id, {
            [nextSlot.slot]: winnerId
          });
        }
      }
    }

    // Check if tournament is complete
    const allMatches = await db.tournamentMatches.findByTournamentId(tournamentId);
    const isComplete = isTournamentComplete(allMatches, tournament.bracketType);

    if (isComplete) {
      const tournamentWinner = getTournamentWinner(allMatches, tournament.bracketType);
      await db.tournaments.update(tournamentId, {
        status: 'completed',
        winnerId: tournamentWinner,
        completedAt: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Resultado registrado',
      eloChanges: {
        winner: { id: winnerId, name: winner.username, change: winnerChange },
        loser: { id: loserId, name: loser.username, change: loserChange }
      },
      tournamentComplete: isComplete,
      needsFinalReset: tournament.bracketType === 'double' &&
        tournamentMatch.bracket === 'grand_final' &&
        winnerId === tournamentMatch.player2Id &&
        tournament.bracketReset
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Tournament match error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
