const K_FACTOR = 32;
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}
function calculateNewRating(currentRating, expected, actual) {
  return Math.round(currentRating + K_FACTOR * (actual - expected));
}
function calculate1v1Elo(winnerRating, loserRating) {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);
  const newWinnerRating = calculateNewRating(winnerRating, expectedWinner, 1);
  const newLoserRating = calculateNewRating(loserRating, expectedLoser, 0);
  return {
    winnerChange: newWinnerRating - winnerRating,
    loserChange: newLoserRating - loserRating
  };
}
function calculateTeamElo(winningTeamRatings, losingTeamRatings) {
  const avgWinnerRating = winningTeamRatings.reduce((a, b) => a + b, 0) / winningTeamRatings.length;
  const avgLoserRating = losingTeamRatings.reduce((a, b) => a + b, 0) / losingTeamRatings.length;
  const expectedWinner = expectedScore(avgWinnerRating, avgLoserRating);
  const expectedLoser = expectedScore(avgLoserRating, avgWinnerRating);
  const winnerChanges = winningTeamRatings.map((rating) => {
    const newRating = calculateNewRating(rating, expectedWinner, 1);
    return newRating - rating;
  });
  const loserChanges = losingTeamRatings.map((rating) => {
    const newRating = calculateNewRating(rating, expectedLoser, 0);
    return newRating - rating;
  });
  return { winnerChanges, loserChanges };
}
function calculateFfaElo(winnerRating, loserRatings) {
  let totalWinnerChange = 0;
  const loserChanges = [];
  for (const loserRating of loserRatings) {
    const { winnerChange, loserChange } = calculate1v1Elo(winnerRating, loserRating);
    const scaleFactor = 1 / loserRatings.length;
    totalWinnerChange += Math.round(winnerChange * scaleFactor);
    loserChanges.push(Math.round(loserChange * scaleFactor));
  }
  return {
    winnerChange: totalWinnerChange,
    loserChanges
  };
}
function getRatingTier(rating) {
  if (rating >= 1800) return "Leyenda";
  if (rating >= 1600) return "Maestro";
  if (rating >= 1400) return "Experto";
  if (rating >= 1200) return "Veterano";
  if (rating >= 1e3) return "Soldado";
  if (rating >= 800) return "Recluta";
  return "Colono";
}
function getTierColor(rating) {
  if (rating >= 1800) return "text-yellow-400";
  if (rating >= 1600) return "text-purple-400";
  if (rating >= 1400) return "text-blue-400";
  if (rating >= 1200) return "text-green-400";
  if (rating >= 1e3) return "text-gray-300";
  if (rating >= 800) return "text-orange-400";
  return "text-stone-400";
}

export { calculateTeamElo as a, calculateFfaElo as b, calculate1v1Elo as c, getTierColor as d, getRatingTier as g };
