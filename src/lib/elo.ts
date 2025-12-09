// ELO Rating System for Age of Empires 3 Tracker

const K_FACTOR = 32; // How much ratings can change per game

/**
 * Calculate expected score (probability of winning)
 */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO rating
 */
function calculateNewRating(currentRating: number, expected: number, actual: number): number {
  return Math.round(currentRating + K_FACTOR * (actual - expected));
}

/**
 * Calculate ELO changes for a 1v1 match
 */
export function calculate1v1Elo(
  winnerRating: number,
  loserRating: number
): { winnerChange: number; loserChange: number } {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  const newWinnerRating = calculateNewRating(winnerRating, expectedWinner, 1);
  const newLoserRating = calculateNewRating(loserRating, expectedLoser, 0);

  return {
    winnerChange: newWinnerRating - winnerRating,
    loserChange: newLoserRating - loserRating,
  };
}

/**
 * Calculate ELO changes for team games
 * Uses average team rating
 */
export function calculateTeamElo(
  winningTeamRatings: number[],
  losingTeamRatings: number[]
): { winnerChanges: number[]; loserChanges: number[] } {
  const avgWinnerRating = winningTeamRatings.reduce((a, b) => a + b, 0) / winningTeamRatings.length;
  const avgLoserRating = losingTeamRatings.reduce((a, b) => a + b, 0) / losingTeamRatings.length;

  const expectedWinner = expectedScore(avgWinnerRating, avgLoserRating);
  const expectedLoser = expectedScore(avgLoserRating, avgWinnerRating);

  const winnerChanges = winningTeamRatings.map(rating => {
    const newRating = calculateNewRating(rating, expectedWinner, 1);
    return newRating - rating;
  });

  const loserChanges = losingTeamRatings.map(rating => {
    const newRating = calculateNewRating(rating, expectedLoser, 0);
    return newRating - rating;
  });

  return { winnerChanges, loserChanges };
}

/**
 * Calculate ELO changes for FFA (Free For All)
 * Winner gets points from all losers based on their ratings
 */
export function calculateFfaElo(
  winnerRating: number,
  loserRatings: number[]
): { winnerChange: number; loserChanges: number[] } {
  let totalWinnerChange = 0;
  const loserChanges: number[] = [];

  // Each loser "plays" against the winner
  for (const loserRating of loserRatings) {
    const { winnerChange, loserChange } = calculate1v1Elo(winnerRating, loserRating);
    // Scale down changes in FFA to prevent massive swings
    const scaleFactor = 1 / loserRatings.length;
    totalWinnerChange += Math.round(winnerChange * scaleFactor);
    loserChanges.push(Math.round(loserChange * scaleFactor));
  }

  return {
    winnerChange: totalWinnerChange,
    loserChanges,
  };
}

/**
 * Get rating tier name
 */
export function getRatingTier(rating: number): string {
  if (rating >= 1800) return 'Leyenda';
  if (rating >= 1600) return 'Maestro';
  if (rating >= 1400) return 'Experto';
  if (rating >= 1200) return 'Veterano';
  if (rating >= 1000) return 'Soldado';
  if (rating >= 800) return 'Recluta';
  return 'Colono';
}

/**
 * Get tier color class
 */
export function getTierColor(rating: number): string {
  if (rating >= 1800) return 'text-yellow-400';
  if (rating >= 1600) return 'text-purple-400';
  if (rating >= 1400) return 'text-blue-400';
  if (rating >= 1200) return 'text-green-400';
  if (rating >= 1000) return 'text-gray-300';
  if (rating >= 800) return 'text-orange-400';
  return 'text-stone-400';
}
