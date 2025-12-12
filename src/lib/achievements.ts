import { db, statsQueries } from '../db';
import { getPlayerFullStats, getNemesisAndVictim } from './stats';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'glory' | 'shame' | 'neutral';
  unlocked: boolean;
  unlockedAt?: Date;
  extra?: string;
}

// Versión optimizada que acepta stats pre-calculados para evitar duplicación
export async function getPlayerAchievements(
  playerId: number,
  preloadedStats?: { fullStats: Awaited<ReturnType<typeof getPlayerFullStats>>; nemesisVictim: Awaited<ReturnType<typeof getNemesisAndVictim>> }
): Promise<Achievement[]> {
  const achievements: Achievement[] = [];

  // Usar stats pre-cargados si se proporcionan, sino calcularlos
  const stats = preloadedStats?.fullStats ?? await getPlayerFullStats(playerId);
  const { nemesis, victim } = preloadedStats?.nemesisVictim ?? await getNemesisAndVictim(playerId);

  if (stats.totalWins >= 1) {
    achievements.push({ id: 'first_blood', name: 'Primera Sangre', description: 'Ganaste tu primera partida', icon: '🩸', type: 'glory', unlocked: true });
  }
  if (stats.maxWinStreak >= 3) {
    achievements.push({ id: 'win_streak_3', name: 'En Racha', description: '3 victorias seguidas', icon: '🔥', type: 'glory', unlocked: true });
  }
  if (stats.maxWinStreak >= 5) {
    achievements.push({ id: 'win_streak_5', name: 'Bestia Imparable', description: '5 victorias seguidas', icon: '💪', type: 'glory', unlocked: true });
  }
  if (stats.maxWinStreak >= 10) {
    achievements.push({ id: 'win_streak_10', name: 'Dios del Age', description: '10 victorias seguidas', icon: '👑', type: 'glory', unlocked: true });
  }
  if (stats.totalWins >= 10) {
    achievements.push({ id: 'wins_10', name: 'Veterano', description: '10 victorias totales', icon: '🎖️', type: 'glory', unlocked: true });
  }
  if (stats.totalWins >= 50) {
    achievements.push({ id: 'wins_50', name: 'Leyenda', description: '50 victorias totales', icon: '🏆', type: 'glory', unlocked: true });
  }
  if (victim && victim.wins >= 5) {
    achievements.push({ id: 'has_victim', name: `Papá de ${victim.name}`, description: `Le ganaste ${victim.wins} veces a ${victim.name}`, icon: '👶', type: 'glory', unlocked: true, extra: victim.name });
  }

  const firstMatch = await getFirstMatchResult(playerId);
  if (firstMatch === false) {
    achievements.push({ id: 'tourist', name: 'Turista', description: 'Perdiste tu primera partida', icon: '🧳', type: 'shame', unlocked: true });
  }
  if (stats.maxLossStreak >= 3) {
    achievements.push({ id: 'loss_streak_3', name: 'Mala Racha', description: '3 derrotas seguidas', icon: '😰', type: 'shame', unlocked: true });
  }
  if (stats.maxLossStreak >= 5) {
    achievements.push({ id: 'loss_streak_5', name: 'Calentador de Banco', description: '5 derrotas seguidas', icon: '🪑', type: 'shame', unlocked: true });
  }
  if (stats.maxLossStreak >= 10) {
    achievements.push({ id: 'loss_streak_10', name: 'Masoquista Profesional', description: '10 derrotas seguidas', icon: '💀', type: 'shame', unlocked: true });
  }
  if (nemesis && nemesis.losses >= 5) {
    achievements.push({ id: 'has_nemesis', name: `Hijo de ${nemesis.name}`, description: `${nemesis.name} te ganó ${nemesis.losses} veces`, icon: '👨', type: 'shame', unlocked: true, extra: nemesis.name });
  }
  if (stats.totalLosses >= 10) {
    achievements.push({ id: 'losses_10', name: 'Perseverante', description: '10 derrotas y seguís jugando', icon: '🤕', type: 'shame', unlocked: true });
  }

  if (stats.totalMatches >= 50) {
    achievements.push({ id: 'matches_50', name: 'Vicioso', description: '50 partidas jugadas', icon: '🎮', type: 'neutral', unlocked: true });
  }
  if (stats.totalMatches >= 100) {
    achievements.push({ id: 'matches_100', name: 'Sin Vida Social', description: '100 partidas jugadas', icon: '🏠', type: 'neutral', unlocked: true });
  }
  if (stats.totalMatches >= 10 && stats.winRate >= 60) {
    achievements.push({ id: 'winrate_60', name: 'Consistente', description: 'Win rate mayor al 60%', icon: '📈', type: 'glory', unlocked: true });
  }
  if (stats.totalMatches >= 10 && stats.winRate < 40) {
    achievements.push({ id: 'winrate_40', name: 'Inconsistente', description: 'Win rate menor al 40%', icon: '📉', type: 'shame', unlocked: true });
  }

  return achievements;
}

// Optimizado: usa una sola consulta SQL
async function getFirstMatchResult(playerId: number): Promise<boolean | null> {
  return statsQueries.getFirstMatchResult(playerId);
}

export function countAchievementsByType(achievements: Achievement[]) {
  return {
    glory: achievements.filter(a => a.type === 'glory').length,
    shame: achievements.filter(a => a.type === 'shame').length,
    neutral: achievements.filter(a => a.type === 'neutral').length,
    total: achievements.length,
  };
}
