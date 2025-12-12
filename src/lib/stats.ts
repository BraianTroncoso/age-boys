import { db } from '../db';

// Frases para el boludo de la semana
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
  "El que calienta el banco",
];

// Frases para rachas de victorias
const frasesRachaVictorias = [
  "ESTÁ ON FIRE",
  "IMPARABLE",
  "MÁQUINA DE GANAR",
  "LE PEGA A TODOS",
  "NADIE LO PARA",
  "MODO BESTIA ACTIVADO",
];

// Frases para rachas de derrotas
const frasesRachaDerrotas = [
  "EN BAJÓN TOTAL",
  "TOCÓ FONDO",
  "DEPRESIÓN PURA",
  "QUE ALGUIEN LO AYUDE",
  "MODO BOLUDO ACTIVADO",
  "SE OLVIDÓ DE JUGAR",
];

// Frases para némesis
const frasesNemesis = [
  "te tiene de hijo",
  "te hace pija siempre",
  "te cogió de parado",
  "es tu papá en el Age",
  "te pasea cuando quiere",
];

// Frases para víctima
const frasesVictima = [
  "es tu perra",
  "lo tenés de hijo",
  "lo cogés cuando querés",
  "es tu víctima favorita",
  "lo paseas siempre",
];

// Frases para el pollera de la semana (el que menos jugo)
const frasesPollera = [
  "La mujer no lo deja ni tocar la PC",
  "Le sacaron la placa de video de castigo",
  "Esta domado por la patrona",
  "Le cortaron el WiFi por mandarina",
  "Tiene prohibido el Age despues de las 10",
  "La mujer le puso contraseña a la PC",
  "Lo tienen de empleado domestico",
  "El que lava los platos mientras ustedes juegan",
  "Su novia lo tiene de sirviente",
  "Le dieron de baja la suscripcion de hombre",
  "El mas sometido del grupo",
  "La jermu le escondio el mouse",
  "Esta en penitencia gamer",
  "El unico que pide permiso para jugar",
  "La señora le puso horario de visita al Age",
  "Vive bajo el regimen de la patrona",
];

export function getRandomFrase(frases: string[]): string {
  return frases[Math.floor(Math.random() * frases.length)];
}

export function getFrasesBoludoSemana(): string[] {
  return frasesBoludoSemana;
}

/**
 * Obtiene el boludo de la semana (más derrotas en los últimos 7 días)
 */
export async function getWeeklyLoser() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const allMatches = await db.matches.findAll();
  const recentMatches = allMatches.filter(m => new Date(m.playedAt) >= oneWeekAgo);

  if (recentMatches.length === 0) return null;

  // Contar derrotas por jugador
  const lossCount: Record<number, number> = {};
  const winCount: Record<number, number> = {};

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

  // Encontrar el que más perdió (excluyendo admin)
  let maxLosses = 0;
  let loserId: number | null = null;

  for (const [playerId, losses] of Object.entries(lossCount)) {
    const player = await db.users.findById(parseInt(playerId));
    // Excluir admin del boludo de la semana
    if (player && player.username === 'admin') continue;

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
    frase: getRandomFrase(frasesBoludoSemana),
  };
}

/**
 * Obtiene la racha actual del jugador
 */
export async function getPlayerStreak(playerId: number) {
  const allMatches = await db.matches.findAll();

  // Obtener partidas del jugador ordenadas por fecha (más reciente primero)
  const playerMatches: { matchId: number; playedAt: Date; isWinner: boolean }[] = [];

  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find(p => p.playerId === playerId);
    if (playerPart) {
      playerMatches.push({
        matchId: match.id,
        playedAt: new Date(match.playedAt),
        isWinner: playerPart.isWinner,
      });
    }
  }

  if (playerMatches.length === 0) {
    return { type: 'none', count: 0, frase: 'Sin partidas' };
  }

  // Ordenar por fecha descendente
  playerMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());

  // Contar racha actual
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
    return { type: 'none', count: 0, frase: 'Sin racha' };
  }

  if (firstResult) {
    return {
      type: 'win',
      count: streak,
      frase: getRandomFrase(frasesRachaVictorias),
    };
  } else {
    return {
      type: 'loss',
      count: streak,
      frase: getRandomFrase(frasesRachaDerrotas),
    };
  }
}

/**
 * Obtiene némesis y víctima del jugador (solo 1v1)
 */
export async function getNemesisAndVictim(playerId: number) {
  const allMatches = (await db.matches.findAll()).filter(m => m.matchType === '1v1');

  // Record de victorias/derrotas contra cada oponente
  const record: Record<number, { wins: number; losses: number; opponentName: string }> = {};

  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find(p => p.playerId === playerId);

    if (!playerPart) continue;

    const opponent = participants.find(p => p.playerId !== playerId);
    if (!opponent) continue;

    if (!record[opponent.playerId]) {
      const opponentUser = await db.users.findById(opponent.playerId);
      record[opponent.playerId] = {
        wins: 0,
        losses: 0,
        opponentName: opponentUser?.username || 'Desconocido',
      };
    }

    if (playerPart.isWinner) {
      record[opponent.playerId].wins++;
    } else {
      record[opponent.playerId].losses++;
    }
  }

  // Encontrar némesis (más derrotas)
  let nemesis: { playerId: number; name: string; wins: number; losses: number; frase: string } | null = null;
  let maxLosses = 0;

  // Encontrar víctima (más victorias)
  let victim: { playerId: number; name: string; wins: number; losses: number; frase: string } | null = null;
  let maxWins = 0;

  for (const [opponentId, stats] of Object.entries(record)) {
    if (stats.losses > maxLosses && stats.losses >= 2) {
      maxLosses = stats.losses;
      nemesis = {
        playerId: parseInt(opponentId),
        name: stats.opponentName,
        wins: stats.wins,
        losses: stats.losses,
        frase: getRandomFrase(frasesNemesis),
      };
    }

    if (stats.wins > maxWins && stats.wins >= 2) {
      maxWins = stats.wins;
      victim = {
        playerId: parseInt(opponentId),
        name: stats.opponentName,
        wins: stats.wins,
        losses: stats.losses,
        frase: getRandomFrase(frasesVictima),
      };
    }
  }

  return { nemesis, victim };
}

/**
 * Obtiene estadísticas completas del jugador
 */
export async function getPlayerFullStats(playerId: number) {
  const allMatches = await db.matches.findAll();
  let totalWins = 0;
  let totalLosses = 0;

  const matchHistory: { playedAt: Date; isWinner: boolean }[] = [];

  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find(p => p.playerId === playerId);

    if (playerPart) {
      matchHistory.push({
        playedAt: new Date(match.playedAt),
        isWinner: playerPart.isWinner,
      });

      if (playerPart.isWinner) {
        totalWins++;
      } else {
        totalLosses++;
      }
    }
  }

  // Ordenar por fecha
  matchHistory.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());

  // Calcular rachas máximas
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
    winRate: totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0,
    maxWinStreak,
    maxLossStreak,
  };
}

/**
 * Obtiene el pollera de la semana (el que menos partidas jugo en los ultimos 7 dias)
 * Si hay empate, rota aleatoriamente entre los candidatos
 */
export async function getWeeklyPollera() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const allMatches = await db.matches.findAll();
  const recentMatches = allMatches.filter(m => new Date(m.playedAt) >= oneWeekAgo);

  // Contar partidas por jugador en la semana
  const gamesCount: Record<number, number> = {};

  for (const match of recentMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    for (const p of participants) {
      if (!gamesCount[p.playerId]) gamesCount[p.playerId] = 0;
      gamesCount[p.playerId]++;
    }
  }

  // Obtener TODOS los jugadores (incluso los que no jugaron)
  const allPlayers = await db.users.findAllPlayers();

  // Encontrar minimo de partidas (excluyendo admin)
  let minGames = Infinity;
  const candidates: typeof allPlayers = [];

  for (const player of allPlayers) {
    if (player.username === 'admin') continue;

    const games = gamesCount[player.id] || 0;
    if (games < minGames) {
      minGames = games;
      candidates.length = 0;
      candidates.push(player);
    } else if (games === minGames) {
      candidates.push(player);
    }
  }

  if (candidates.length === 0) return null;

  // Random entre candidatos empatados
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  return {
    player: selected,
    gamesPlayed: minGames === Infinity ? 0 : minGames,
    frase: getRandomFrase(frasesPollera),
  };
}
