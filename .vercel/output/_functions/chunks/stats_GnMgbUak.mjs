import { d as db } from './index_Bw9JdCU_.mjs';

const frasesBoludoSemana = [
  "Se lo cogieron toda la semana",
  "El que menos sabe agarrar el mouse",
  "Ni su mamá le tiene fe",
  "El pecho más frío del grupo",
  "El queso más grande del Age",
  "Profesional en perder",
  "Le pegan hasta los bots",
  "El manco oficial de la semana",
  "Debería dedicarse a otra cosa",
  "Sus aldeanos se suicidan de la vergüenza",
  "Hasta un pibe de 5 le gana",
  "El que calienta el banco"
];
const frasesRachaVictorias = [
  "ESTÁ ON FIRE",
  "IMPARABLE",
  "MÁQUINA DE GANAR",
  "LE PEGA A TODOS",
  "NADIE LO PARA",
  "MODO BESTIA ACTIVADO"
];
const frasesRachaDerrotas = [
  "EN BAJÓN TOTAL",
  "TOCÓ FONDO",
  "DEPRESIÓN PURA",
  "QUE ALGUIEN LO AYUDE",
  "MODO BOLUDO ACTIVADO",
  "SE OLVIDÓ DE JUGAR"
];
const frasesNemesis = [
  "te tiene de hijo",
  "te hace pija siempre",
  "te cogió de parado",
  "es tu papá en el Age",
  "te pasea cuando quiere"
];
const frasesVictima = [
  "es tu perra",
  "lo tenés de hijo",
  "lo cogés cuando querés",
  "es tu víctima favorita",
  "lo paseas siempre"
];
function getRandomFrase(frases) {
  return frases[Math.floor(Math.random() * frases.length)];
}
async function getWeeklyLoser() {
  const oneWeekAgo = /* @__PURE__ */ new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const allMatches = await db.matches.findAll();
  const recentMatches = allMatches.filter((m) => new Date(m.playedAt) >= oneWeekAgo);
  if (recentMatches.length === 0) return null;
  const lossCount = {};
  const winCount = {};
  for (const match of recentMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    for (const p of participants) {
      if (!lossCount[p.playerId]) lossCount[p.playerId] = 0;
      if (!winCount[p.playerId]) winCount[p.playerId] = 0;
      if (p.isWinner) {
        winCount[p.playerId]++;
      } else {
        lossCount[p.playerId]++;
      }
    }
  }
  let maxLosses = 0;
  let loserId = null;
  for (const [playerId, losses] of Object.entries(lossCount)) {
    if (losses > maxLosses) {
      maxLosses = losses;
      loserId = parseInt(playerId);
    }
  }
  if (!loserId || maxLosses === 0) return null;
  const loser = await db.users.findById(loserId);
  if (!loser) return null;
  return {
    player: loser,
    losses: maxLosses,
    wins: winCount[loserId] || 0,
    frase: getRandomFrase(frasesBoludoSemana)
  };
}
async function getPlayerStreak(playerId) {
  const allMatches = await db.matches.findAll();
  const playerMatches = [];
  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find((p) => p.playerId === playerId);
    if (playerPart) {
      playerMatches.push({
        matchId: match.id,
        playedAt: new Date(match.playedAt),
        isWinner: playerPart.isWinner
      });
    }
  }
  if (playerMatches.length === 0) {
    return { type: "none", count: 0, frase: "Sin partidas" };
  }
  playerMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
  const firstResult = playerMatches[0].isWinner;
  let streak = 1;
  for (let i = 1; i < playerMatches.length; i++) {
    if (playerMatches[i].isWinner === firstResult) {
      streak++;
    } else {
      break;
    }
  }
  if (streak < 2) {
    return { type: "none", count: 0, frase: "Sin racha" };
  }
  if (firstResult) {
    return {
      type: "win",
      count: streak,
      frase: getRandomFrase(frasesRachaVictorias)
    };
  } else {
    return {
      type: "loss",
      count: streak,
      frase: getRandomFrase(frasesRachaDerrotas)
    };
  }
}
async function getNemesisAndVictim(playerId) {
  const allMatches = (await db.matches.findAll()).filter((m) => m.matchType === "1v1");
  const record = {};
  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find((p) => p.playerId === playerId);
    if (!playerPart) continue;
    const opponent = participants.find((p) => p.playerId !== playerId);
    if (!opponent) continue;
    if (!record[opponent.playerId]) {
      const opponentUser = await db.users.findById(opponent.playerId);
      record[opponent.playerId] = {
        wins: 0,
        losses: 0,
        opponentName: opponentUser?.username || "Desconocido"
      };
    }
    if (playerPart.isWinner) {
      record[opponent.playerId].wins++;
    } else {
      record[opponent.playerId].losses++;
    }
  }
  let nemesis = null;
  let maxLosses = 0;
  let victim = null;
  let maxWins = 0;
  for (const [opponentId, stats] of Object.entries(record)) {
    if (stats.losses > maxLosses && stats.losses >= 2) {
      maxLosses = stats.losses;
      nemesis = {
        playerId: parseInt(opponentId),
        name: stats.opponentName,
        wins: stats.wins,
        losses: stats.losses,
        frase: getRandomFrase(frasesNemesis)
      };
    }
    if (stats.wins > maxWins && stats.wins >= 2) {
      maxWins = stats.wins;
      victim = {
        playerId: parseInt(opponentId),
        name: stats.opponentName,
        wins: stats.wins,
        losses: stats.losses,
        frase: getRandomFrase(frasesVictima)
      };
    }
  }
  return { nemesis, victim };
}
async function getPlayerFullStats(playerId) {
  const allMatches = await db.matches.findAll();
  let totalWins = 0;
  let totalLosses = 0;
  const matchHistory = [];
  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find((p) => p.playerId === playerId);
    if (playerPart) {
      matchHistory.push({
        playedAt: new Date(match.playedAt),
        isWinner: playerPart.isWinner
      });
      if (playerPart.isWinner) {
        totalWins++;
      } else {
        totalLosses++;
      }
    }
  }
  matchHistory.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let winStreak = 0;
  let lossStreak = 0;
  for (const match of matchHistory) {
    if (match.isWinner) {
      winStreak++;
      lossStreak = 0;
      if (winStreak > maxWinStreak) maxWinStreak = winStreak;
    } else {
      lossStreak++;
      winStreak = 0;
      if (lossStreak > maxLossStreak) maxLossStreak = lossStreak;
    }
  }
  return {
    totalWins,
    totalLosses,
    totalMatches: totalWins + totalLosses,
    winRate: totalWins + totalLosses > 0 ? Math.round(totalWins / (totalWins + totalLosses) * 100) : 0,
    maxWinStreak,
    maxLossStreak
  };
}

export { getNemesisAndVictim as a, getPlayerStreak as b, getWeeklyLoser as c, getPlayerFullStats as g };
