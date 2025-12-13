// Tournament bracket logic for AoE3 Tracker

import type { TournamentMatch } from '../db';

export type BracketType = 'single' | 'double';
export type MatchBracket = 'winners' | 'losers' | 'grand_final' | 'final_reset';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get total number of rounds for a tournament size
 * 4 players = 2 rounds, 8 players = 3 rounds, 16 players = 4 rounds
 */
export function getTotalRounds(size: number): number {
  return Math.log2(size);
}

/**
 * Get round name based on round number and total rounds
 */
export function getRoundName(round: number, totalRounds: number): string {
  if (round === 1) return 'Final';
  if (round === 2) return 'Semifinales';
  if (round === 3) return 'Cuartos de Final';
  if (round === 4) return 'Octavos de Final';
  return `Ronda ${round}`;
}

/**
 * Generate initial bracket matches for a single elimination tournament
 * Returns array of matches to be created in the database
 * Handles byes for non-power-of-2 player counts
 */
export function generateBracketMatches(
  tournamentId: number,
  playerIds: number[]
): Omit<TournamentMatch, 'id'>[] {
  const shuffled = shuffleArray(playerIds);
  const playerCount = shuffled.length;
  const bracketSize = getBracketSize(playerCount);
  const byeCount = getByeCount(playerCount);
  const totalRounds = getTotalRounds(bracketSize);
  const matches: Omit<TournamentMatch, 'id'>[] = [];

  // For power of 2, no byes needed
  if (byeCount === 0) {
    const firstRound = totalRounds;
    const matchesInFirstRound = playerCount / 2;

    for (let i = 0; i < matchesInFirstRound; i++) {
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: firstRound,
        position: i,
        player1Id: shuffled[i * 2],
        player2Id: shuffled[i * 2 + 1],
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Generate empty matches for subsequent rounds
    for (let r = firstRound - 1; r >= 1; r--) {
      const matchesInRound = Math.pow(2, r - 1);
      for (let p = 0; p < matchesInRound; p++) {
        matches.push({
          tournamentId,
          bracket: 'winners',
          round: r,
          position: p,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          matchId: null,
          playedAt: null
        });
      }
    }
  } else {
    // Handle byes (e.g., 6 players -> 2 byes)
    // Players with byes go directly to round 2, others play in round 3
    const firstRound = totalRounds;
    const playersWithByes = shuffled.slice(0, byeCount);
    const playersInFirstRound = shuffled.slice(byeCount);
    const matchesInFirstRound = playersInFirstRound.length / 2;

    // First round matches (only for players without byes)
    for (let i = 0; i < matchesInFirstRound; i++) {
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: firstRound,
        position: i + byeCount, // Offset positions to leave room for bye slots
        player1Id: playersInFirstRound[i * 2],
        player2Id: playersInFirstRound[i * 2 + 1],
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Second round (semifinals for 6 players) - players with byes start here
    const secondRound = firstRound - 1;
    const matchesInSecondRound = bracketSize / 4;

    for (let p = 0; p < matchesInSecondRound; p++) {
      // First positions get bye players
      const hasByePlayer = p < byeCount;
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: secondRound,
        position: p,
        player1Id: hasByePlayer ? playersWithByes[p] : null,
        player2Id: null, // Will be filled by first round winners
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Generate remaining rounds (final, etc.)
    for (let r = secondRound - 1; r >= 1; r--) {
      const matchesInRound = Math.pow(2, r - 1);
      for (let p = 0; p < matchesInRound; p++) {
        matches.push({
          tournamentId,
          bracket: 'winners',
          round: r,
          position: p,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          matchId: null,
          playedAt: null
        });
      }
    }
  }

  return matches;
}

/**
 * Get the number of losers bracket rounds
 * 4 players = 2 losers rounds, 8 players = 4 losers rounds, 16 players = 6 losers rounds
 */
export function getLosersRounds(size: number): number {
  const winnersRounds = getTotalRounds(size);
  return (winnersRounds - 1) * 2;
}

/**
 * Generate bracket matches for a double elimination tournament
 * Supports non-power-of-2 player counts using byes (e.g., 6 players)
 */
export function generateDoubleEliminationBracket(
  tournamentId: number,
  playerIds: number[]
): Omit<TournamentMatch, 'id'>[] {
  const shuffled = shuffleArray(playerIds);
  const playerCount = shuffled.length;
  const bracketSize = getBracketSize(playerCount);
  const byeCount = getByeCount(playerCount);
  const totalWinnersRounds = getTotalRounds(bracketSize);
  const totalLosersRounds = getLosersRounds(bracketSize);
  const matches: Omit<TournamentMatch, 'id'>[] = [];

  // ==================== WINNERS BRACKET ====================

  if (byeCount === 0) {
    // No byes needed - original logic for power of 2
    const firstRound = totalWinnersRounds;
    const matchesInFirstRound = playerCount / 2;

    for (let i = 0; i < matchesInFirstRound; i++) {
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: firstRound,
        position: i,
        player1Id: shuffled[i * 2],
        player2Id: shuffled[i * 2 + 1],
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Generate empty matches for subsequent winners rounds
    for (let r = firstRound - 1; r >= 1; r--) {
      const matchesInRound = Math.pow(2, r - 1);
      for (let p = 0; p < matchesInRound; p++) {
        matches.push({
          tournamentId,
          bracket: 'winners',
          round: r,
          position: p,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          matchId: null,
          playedAt: null
        });
      }
    }
  } else {
    // Handle byes (e.g., 6 players -> bracketSize=8, byeCount=2)
    const firstRound = totalWinnersRounds;
    const playersWithByes = shuffled.slice(0, byeCount);
    const playersInFirstRound = shuffled.slice(byeCount);
    const matchesInFirstRound = playersInFirstRound.length / 2;

    // First round matches (only for players without byes)
    // Positions are offset by byeCount to leave room for bye "slots"
    for (let i = 0; i < matchesInFirstRound; i++) {
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: firstRound,
        position: i + byeCount,
        player1Id: playersInFirstRound[i * 2],
        player2Id: playersInFirstRound[i * 2 + 1],
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Second round (where bye players enter)
    const secondRound = firstRound - 1;
    const matchesInSecondRound = bracketSize / 4;

    for (let p = 0; p < matchesInSecondRound; p++) {
      // First positions get bye players
      const hasByePlayer = p < byeCount;
      matches.push({
        tournamentId,
        bracket: 'winners',
        round: secondRound,
        position: p,
        player1Id: hasByePlayer ? playersWithByes[p] : null,
        player2Id: null, // Will be filled by first round winners
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    // Generate remaining winners rounds (final, etc.)
    for (let r = secondRound - 1; r >= 1; r--) {
      const matchesInRound = Math.pow(2, r - 1);
      for (let p = 0; p < matchesInRound; p++) {
        matches.push({
          tournamentId,
          bracket: 'winners',
          round: r,
          position: p,
          player1Id: null,
          player2Id: null,
          winnerId: null,
          matchId: null,
          playedAt: null
        });
      }
    }
  }

  // ==================== LOSERS BRACKET ====================
  // Structure is based on bracketSize, not playerCount
  // For 8-size bracket: LR4 (2 matches), LR3 (2 matches), LR2 (1 match), LR1 (1 match)
  // With byes, some slots may stay empty (no losers from bye positions)

  const matchesInFirstWinnersRound = bracketSize / 2;
  let currentLosersRound = totalLosersRounds;
  let matchesInCurrentLosersRound = matchesInFirstWinnersRound / 2;

  while (currentLosersRound >= 1) {
    for (let p = 0; p < matchesInCurrentLosersRound; p++) {
      matches.push({
        tournamentId,
        bracket: 'losers',
        round: currentLosersRound,
        position: p,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        matchId: null,
        playedAt: null
      });
    }

    currentLosersRound--;

    // On odd rounds (counting down), it's a "drop-in" round (same number of matches)
    // On even rounds, it's a "consolidation" round (halves the matches)
    if (currentLosersRound >= 1 && currentLosersRound % 2 === 0) {
      // Consolidation - same number of matches (winners face each other)
    } else if (currentLosersRound >= 1) {
      // Drop-in round - number of matches halves
      matchesInCurrentLosersRound = Math.max(1, matchesInCurrentLosersRound / 2);
    }
  }

  // ==================== GRAND FINAL ====================
  matches.push({
    tournamentId,
    bracket: 'grand_final',
    round: 1,
    position: 0,
    player1Id: null, // Winners bracket champion
    player2Id: null, // Losers bracket champion
    winnerId: null,
    matchId: null,
    playedAt: null
  });

  // ==================== FINAL RESET ====================
  // Only played if losers bracket champion wins grand final
  matches.push({
    tournamentId,
    bracket: 'final_reset',
    round: 1,
    position: 0,
    player1Id: null,
    player2Id: null,
    winnerId: null,
    matchId: null,
    playedAt: null
  });

  return matches;
}

/**
 * Calculate where the winner should advance to (Single Elimination)
 */
export function getNextMatchSlot(
  currentRound: number,
  currentPosition: number
): { nextRound: number; nextPosition: number; slot: 'player1Id' | 'player2Id' } | null {
  // If it's the final (round 1), there's no next match
  if (currentRound === 1) return null;

  const nextRound = currentRound - 1;
  const nextPosition = Math.floor(currentPosition / 2);
  const slot = currentPosition % 2 === 0 ? 'player1Id' : 'player2Id';

  return { nextRound, nextPosition, slot };
}

/**
 * Calculate where a player should advance to in Double Elimination
 * Returns info about where both winner and loser go
 * Handles tournaments with byes (non-power-of-2 player counts)
 */
export function getDoubleEliminationNextSlot(
  match: TournamentMatch,
  isWinner: boolean,
  tournamentSize: number
): {
  bracket: MatchBracket;
  nextRound: number;
  nextPosition: number;
  slot: 'player1Id' | 'player2Id';
} | null {
  // Use bracket size (power of 2) for all calculations
  const bracketSize = getBracketSize(tournamentSize);
  const byeCount = getByeCount(tournamentSize);
  const totalWinnersRounds = getTotalRounds(bracketSize);
  const totalLosersRounds = getLosersRounds(bracketSize);

  // ==================== WINNERS BRACKET ====================
  if (match.bracket === 'winners') {
    if (isWinner) {
      // Winner advances in winners bracket
      if (match.round === 1) {
        // Winners Final - winner goes to Grand Final as player1
        return { bracket: 'grand_final', nextRound: 1, nextPosition: 0, slot: 'player1Id' };
      }
      // Regular winners progression
      const nextRound = match.round - 1;
      const nextPosition = Math.floor(match.position / 2);
      const slot = match.position % 2 === 0 ? 'player1Id' : 'player2Id';
      return { bracket: 'winners', nextRound, nextPosition, slot };
    } else {
      // Loser drops to losers bracket
      // Calculate which losers round to drop into
      // Losers from first winners round go to highest losers round
      // Losers from second winners round go to losers round - 2, etc.

      // Map winners round to losers round:
      // For 4 players (WR2, WR1 -> LR2, LR1):
      //   WR2 losers -> LR2 (fight each other)
      //   WR1 loser -> LR1 (fights LR2 winner)
      // For 8 players (WR3, WR2, WR1 -> LR4, LR3, LR2, LR1):
      //   WR3 losers -> LR4 (fight each other)
      //   WR2 losers -> LR3 (fight LR4 winners)
      //   WR1 loser -> LR1 (fights LR2 winner)

      const winnersRoundFromTop = totalWinnersRounds - match.round + 1;

      if (match.round === 1) {
        // Winners Final loser -> Losers Final (LR1) as player2
        return { bracket: 'losers', nextRound: 1, nextPosition: 0, slot: 'player2Id' };
      }

      // Calculate losers round for non-final losers
      // WR2 losers (from top round 2) -> top losers round (even number)
      // WR3 losers (from top round 3) -> losers round 2 below max (every 2 rounds down from top)
      const losersRound = totalLosersRounds - (winnersRoundFromTop - 1) * 2;

      // Losers from winners enter as player2 in their losers round (player1 comes from lower losers round)
      // Exception: first losers round where losers fight each other
      if (losersRound === totalLosersRounds) {
        // First losers round - losers from first winners round fight each other
        const isFirstWinnersRound = match.round === totalWinnersRounds;

        if (isFirstWinnersRound && byeCount > 0) {
          // With byes, positions are offset by byeCount
          // Adjust position back to 0-indexed relative to actual matches
          const relativePosition = match.position - byeCount;
          const slot = relativePosition % 2 === 0 ? 'player1Id' : 'player2Id';
          const adjustedPosition = Math.floor(relativePosition / 2);
          return { bracket: 'losers', nextRound: losersRound, nextPosition: adjustedPosition, slot };
        } else {
          // No byes or not first round
          const slot = match.position % 2 === 0 ? 'player1Id' : 'player2Id';
          const adjustedPosition = Math.floor(match.position / 2);
          return { bracket: 'losers', nextRound: losersRound, nextPosition: adjustedPosition, slot };
        }
      } else {
        // Drop-in round - come in as player2
        return { bracket: 'losers', nextRound: losersRound, nextPosition: match.position, slot: 'player2Id' };
      }
    }
  }

  // ==================== LOSERS BRACKET ====================
  if (match.bracket === 'losers') {
    if (!isWinner) {
      // Loser in losers bracket is eliminated
      return null;
    }

    // Winner advances in losers bracket
    if (match.round === 1) {
      // Losers Final winner goes to Grand Final as player2
      return { bracket: 'grand_final', nextRound: 1, nextPosition: 0, slot: 'player2Id' };
    }

    // Calculate next losers round
    const nextRound = match.round - 1;

    // Determine if it's a consolidation round or drop-in round
    // Odd rounds (from bottom) are consolidation, even are drop-in
    if (match.round % 2 === 0) {
      // Even round - winners consolidate (halve matches)
      const nextPosition = Math.floor(match.position / 2);
      const slot = match.position % 2 === 0 ? 'player1Id' : 'player2Id';
      return { bracket: 'losers', nextRound, nextPosition, slot };
    } else {
      // Odd round - winners face drop-ins from winners bracket
      // They become player1, drop-ins become player2
      return { bracket: 'losers', nextRound, nextPosition: match.position, slot: 'player1Id' };
    }
  }

  // ==================== GRAND FINAL ====================
  if (match.bracket === 'grand_final') {
    // Grand Final winner determination handled in API
    return null;
  }

  // ==================== FINAL RESET ====================
  if (match.bracket === 'final_reset') {
    // No advancement from final reset
    return null;
  }

  return null;
}

/**
 * Get round name for losers bracket
 */
export function getLosersRoundName(round: number, totalLosersRounds: number): string {
  if (round === 1) return 'Losers Final';
  if (round === 2) return 'Losers Semifinal';
  return `Losers Ronda ${round}`;
}

/**
 * Check if a match is ready to be played (both players assigned)
 */
export function isMatchReady(match: TournamentMatch): boolean {
  return match.player1Id !== null && match.player2Id !== null && match.winnerId === null;
}

/**
 * Check if a match has been played
 */
export function isMatchPlayed(match: TournamentMatch): boolean {
  return match.winnerId !== null;
}

/**
 * Get tournament progress percentage
 */
export function getTournamentProgress(matches: TournamentMatch[]): number {
  const totalMatches = matches.length;
  const playedMatches = matches.filter(m => m.winnerId !== null).length;
  return Math.round((playedMatches / totalMatches) * 100);
}

/**
 * Get current round (the one being played)
 */
export function getCurrentRound(matches: TournamentMatch[]): number {
  const totalRounds = Math.max(...matches.map(m => m.round));

  for (let r = totalRounds; r >= 1; r--) {
    const roundMatches = matches.filter(m => m.round === r);
    const allPlayed = roundMatches.every(m => m.winnerId !== null);
    const anyReady = roundMatches.some(m => isMatchReady(m));

    if (!allPlayed && anyReady) return r;
    if (!allPlayed && r > 1) {
      // Check if previous round is complete
      const prevRoundMatches = matches.filter(m => m.round === r);
      if (prevRoundMatches.every(m => m.winnerId !== null)) {
        return r - 1;
      }
    }
  }

  return 1;
}

/**
 * Organize matches by round for display
 */
export function organizeMatchesByRound(matches: TournamentMatch[]): Map<number, TournamentMatch[]> {
  const byRound = new Map<number, TournamentMatch[]>();

  for (const match of matches) {
    const roundMatches = byRound.get(match.round) || [];
    roundMatches.push(match);
    byRound.set(match.round, roundMatches);
  }

  // Sort matches within each round by position
  for (const [round, roundMatches] of byRound) {
    byRound.set(round, roundMatches.sort((a, b) => a.position - b.position));
  }

  return byRound;
}

/**
 * Check if tournament is complete
 * For single elimination: final match has winner
 * For double elimination: grand final or final reset has winner
 */
export function isTournamentComplete(matches: TournamentMatch[], bracketType: BracketType = 'single'): boolean {
  if (bracketType === 'single') {
    const finalMatch = matches.find(m => m.bracket === 'winners' && m.round === 1);
    return finalMatch?.winnerId !== null;
  }

  // Double elimination - check grand final and final reset
  const grandFinal = matches.find(m => m.bracket === 'grand_final');
  const finalReset = matches.find(m => m.bracket === 'final_reset');

  if (!grandFinal) return false;

  // If grand final hasn't been played, tournament not complete
  if (grandFinal.winnerId === null) return false;

  // If winners bracket champion won grand final, tournament is complete
  if (grandFinal.winnerId === grandFinal.player1Id) return true;

  // If losers bracket champion won, check if final reset exists and is played (or not needed)
  // Final reset only happens if bracketReset is enabled AND it hasn't been skipped
  if (finalReset && finalReset.player1Id !== null) {
    return finalReset.winnerId !== null;
  }

  // No final reset needed/set up - losers winner takes it
  return true;
}

/**
 * Get tournament winner
 */
export function getTournamentWinner(matches: TournamentMatch[], bracketType: BracketType = 'single'): number | null {
  if (bracketType === 'single') {
    const finalMatch = matches.find(m => m.bracket === 'winners' && m.round === 1);
    return finalMatch?.winnerId || null;
  }

  // Double elimination
  const finalReset = matches.find(m => m.bracket === 'final_reset');
  if (finalReset?.winnerId) {
    return finalReset.winnerId;
  }

  const grandFinal = matches.find(m => m.bracket === 'grand_final');
  return grandFinal?.winnerId || null;
}

/**
 * Validate tournament size
 */
export function isValidTournamentSize(size: number): boolean {
  return [4, 6, 8, 16].includes(size);
}

/**
 * Get the bracket size (next power of 2) for a tournament
 * Used for non-power-of-2 tournaments that need byes
 */
export function getBracketSize(playerCount: number): number {
  // Find next power of 2
  let size = 1;
  while (size < playerCount) {
    size *= 2;
  }
  return size;
}

/**
 * Calculate number of byes needed
 */
export function getByeCount(playerCount: number): number {
  const bracketSize = getBracketSize(playerCount);
  return bracketSize - playerCount;
}
