import type { APIRoute } from 'astro';
import { db } from '../../db';
import { generateBracketMatches, generateDoubleEliminationBracket, isValidTournamentSize } from '../../lib/tournaments';
import type { BracketType } from '../../lib/tournaments';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { name, size, playerIds, bracketType = 'single', bracketReset = true, affectsElo = true } = body as {
      name: string;
      size: number;
      playerIds: number[];
      bracketType?: BracketType;
      bracketReset?: boolean;
      affectsElo?: boolean;
    };

    // Validations
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El nombre del torneo es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isValidTournamentSize(size)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El tamaño debe ser 4, 8 o 16 jugadores'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!playerIds || playerIds.length !== size) {
      return new Response(JSON.stringify({
        success: false,
        error: `Debes seleccionar exactamente ${size} jugadores`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate players
    const uniquePlayers = new Set(playerIds);
    if (uniquePlayers.size !== playerIds.length) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No puede haber jugadores duplicados'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate all players exist
    for (const playerId of playerIds) {
      const player = await db.users.findById(playerId);
      if (!player) {
        return new Response(JSON.stringify({
          success: false,
          error: `Jugador con ID ${playerId} no encontrado`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate bracketType
    if (bracketType !== 'single' && bracketType !== 'double') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Tipo de bracket inválido. Debe ser "single" o "double"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create tournament
    const tournament = await db.tournaments.create({
      name: name.trim(),
      size,
      createdBy: locals.user?.id || 0,
      bracketType,
      bracketReset,
      affectsElo
    });

    // Generate and create bracket matches based on bracket type
    const bracketMatches = bracketType === 'double'
      ? generateDoubleEliminationBracket(tournament.id, playerIds)
      : generateBracketMatches(tournament.id, playerIds);

    for (const match of bracketMatches) {
      await db.tournamentMatches.create(match);
    }

    return new Response(JSON.stringify({
      success: true,
      tournament,
      message: 'Torneo creado exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create tournament error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error del servidor al crear el torneo'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    const tournaments = await db.tournaments.findAll();

    return new Response(JSON.stringify({
      success: true,
      tournaments
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get tournaments error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
