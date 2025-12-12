import { db, statsQueries } from '../db';

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
 * Optimizado: usa una sola consulta SQL con JOINs
 */
export async function getWeeklyLoser() {
  const result = await statsQueries.getWeeklyLoserOptimized();
  if (!result) return null;

  const player = await db.users.findById(result.playerId);
  if (!player) return null;

  return {
    player,
    losses: result.losses,
    wins: result.wins,
    frase: getRandomFrase(frasesBoludoSemana),
  };
}

/**
 * Obtiene la racha actual del jugador
 * Optimizado: usa una sola consulta SQL
 */
export async function getPlayerStreak(playerId: number) {
  const playerMatches = await statsQueries.getPlayerStreakOptimized(playerId);

  if (playerMatches.length === 0) {
    return { type: 'none', count: 0, frase: 'Sin partidas' };
  }

  // Ya viene ordenado por fecha DESC
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
 * Optimizado: usa una sola consulta SQL con JOINs
 */
export async function getNemesisAndVictim(playerId: number) {
  const records = await statsQueries.getNemesisVictimOptimized(playerId);

  let nemesis: { playerId: number; name: string; wins: number; losses: number; frase: string } | null = null;
  let maxLosses = 0;

  let victim: { playerId: number; name: string; wins: number; losses: number; frase: string } | null = null;
  let maxWins = 0;

  for (const record of records) {
    if (record.losses > maxLosses && record.losses >= 2) {
      maxLosses = record.losses;
      nemesis = {
        playerId: record.opponentId,
        name: record.opponentName,
        wins: record.wins,
        losses: record.losses,
        frase: getRandomFrase(frasesNemesis),
      };
    }

    if (record.wins > maxWins && record.wins >= 2) {
      maxWins = record.wins;
      victim = {
        playerId: record.opponentId,
        name: record.opponentName,
        wins: record.wins,
        losses: record.losses,
        frase: getRandomFrase(frasesVictima),
      };
    }
  }

  return { nemesis, victim };
}

/**
 * Obtiene estadísticas completas del jugador
 * Optimizado: usa una sola consulta SQL
 */
export async function getPlayerFullStats(playerId: number) {
  const data = await statsQueries.getPlayerFullStatsOptimized(playerId);

  // Calcular rachas máximas
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let winStreak = 0;
  let lossStreak = 0;

  for (const match of data.history) {
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

  const totalMatches = data.wins + data.losses;

  return {
    totalWins: data.wins,
    totalLosses: data.losses,
    totalMatches,
    winRate: totalMatches > 0 ? Math.round((data.wins / totalMatches) * 100) : 0,
    maxWinStreak,
    maxLossStreak,
  };
}

/**
 * Obtiene el pollera de la semana (el que menos partidas jugo en los ultimos 7 dias)
 * Si hay empate, rota aleatoriamente entre los candidatos
 * Optimizado: usa consultas batch
 */
export async function getWeeklyPollera() {
  // Obtener conteo de partidas de la semana en una sola consulta
  const gamesCount = await statsQueries.getWeeklyGamesCountOptimized();

  // Obtener TODOS los jugadores (incluso los que no jugaron)
  const allPlayers = await db.users.findAllPlayers();

  // Encontrar minimo de partidas (excluyendo admin)
  let minGames = Infinity;
  const candidates: typeof allPlayers = [];

  for (const player of allPlayers) {
    if (player.username === 'admin') continue;

    const games = gamesCount.get(player.id) || 0;
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
