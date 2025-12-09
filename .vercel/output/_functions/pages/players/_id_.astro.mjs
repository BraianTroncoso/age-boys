/* empty css                                           */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../../chunks/index_Bw9JdCU_.mjs';
import { g as getRatingTier, d as getTierColor } from '../../chunks/elo_CBX70JZL.mjs';
import { a as getCivilizationFlag, g as getCivilizationName } from '../../chunks/civilizations_BrVbslyX.mjs';
import { g as getPlayerFullStats, a as getNemesisAndVictim, b as getPlayerStreak } from '../../chunks/stats_GnMgbUak.mjs';
export { renderers } from '../../renderers.mjs';

async function getPlayerAchievements(playerId) {
  const achievements = [];
  const stats = await getPlayerFullStats(playerId);
  const { nemesis, victim } = await getNemesisAndVictim(playerId);
  if (stats.totalWins >= 1) {
    achievements.push({ id: "first_blood", name: "Primera Sangre", description: "Ganaste tu primera partida", icon: "🩸", type: "glory", unlocked: true });
  }
  if (stats.maxWinStreak >= 3) {
    achievements.push({ id: "win_streak_3", name: "En Racha", description: "3 victorias seguidas", icon: "🔥", type: "glory", unlocked: true });
  }
  if (stats.maxWinStreak >= 5) {
    achievements.push({ id: "win_streak_5", name: "Bestia Imparable", description: "5 victorias seguidas", icon: "💪", type: "glory", unlocked: true });
  }
  if (stats.maxWinStreak >= 10) {
    achievements.push({ id: "win_streak_10", name: "Dios del Age", description: "10 victorias seguidas", icon: "👑", type: "glory", unlocked: true });
  }
  if (stats.totalWins >= 10) {
    achievements.push({ id: "wins_10", name: "Veterano", description: "10 victorias totales", icon: "🎖️", type: "glory", unlocked: true });
  }
  if (stats.totalWins >= 50) {
    achievements.push({ id: "wins_50", name: "Leyenda", description: "50 victorias totales", icon: "🏆", type: "glory", unlocked: true });
  }
  if (victim && victim.wins >= 5) {
    achievements.push({ id: "has_victim", name: `Papá de ${victim.name}`, description: `Le ganaste ${victim.wins} veces a ${victim.name}`, icon: "👶", type: "glory", unlocked: true, extra: victim.name });
  }
  const firstMatch = await getFirstMatchResult(playerId);
  if (firstMatch === false) {
    achievements.push({ id: "tourist", name: "Turista", description: "Perdiste tu primera partida", icon: "🧳", type: "shame", unlocked: true });
  }
  if (stats.maxLossStreak >= 3) {
    achievements.push({ id: "loss_streak_3", name: "Mala Racha", description: "3 derrotas seguidas", icon: "😰", type: "shame", unlocked: true });
  }
  if (stats.maxLossStreak >= 5) {
    achievements.push({ id: "loss_streak_5", name: "Calentador de Banco", description: "5 derrotas seguidas", icon: "🪑", type: "shame", unlocked: true });
  }
  if (stats.maxLossStreak >= 10) {
    achievements.push({ id: "loss_streak_10", name: "Masoquista Profesional", description: "10 derrotas seguidas", icon: "💀", type: "shame", unlocked: true });
  }
  if (nemesis && nemesis.losses >= 5) {
    achievements.push({ id: "has_nemesis", name: `Hijo de ${nemesis.name}`, description: `${nemesis.name} te ganó ${nemesis.losses} veces`, icon: "👨", type: "shame", unlocked: true, extra: nemesis.name });
  }
  if (stats.totalLosses >= 10) {
    achievements.push({ id: "losses_10", name: "Perseverante", description: "10 derrotas y seguís jugando", icon: "🤕", type: "shame", unlocked: true });
  }
  if (stats.totalMatches >= 50) {
    achievements.push({ id: "matches_50", name: "Vicioso", description: "50 partidas jugadas", icon: "🎮", type: "neutral", unlocked: true });
  }
  if (stats.totalMatches >= 100) {
    achievements.push({ id: "matches_100", name: "Sin Vida Social", description: "100 partidas jugadas", icon: "🏠", type: "neutral", unlocked: true });
  }
  if (stats.totalMatches >= 10 && stats.winRate >= 60) {
    achievements.push({ id: "winrate_60", name: "Consistente", description: "Win rate mayor al 60%", icon: "📈", type: "glory", unlocked: true });
  }
  if (stats.totalMatches >= 10 && stats.winRate < 40) {
    achievements.push({ id: "winrate_40", name: "Inconsistente", description: "Win rate menor al 40%", icon: "📉", type: "shame", unlocked: true });
  }
  return achievements;
}
async function getFirstMatchResult(playerId) {
  const allMatches = await db.matches.findAll();
  const playerMatches = [];
  for (const match of allMatches) {
    const participants = await db.participants.findByMatchId(match.id);
    const playerPart = participants.find((p) => p.playerId === playerId);
    if (playerPart) {
      playerMatches.push({ playedAt: new Date(match.playedAt), isWinner: playerPart.isWinner });
    }
  }
  if (playerMatches.length === 0) return null;
  playerMatches.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  return playerMatches[0].isWinner;
}
function countAchievementsByType(achievements) {
  return {
    glory: achievements.filter((a) => a.type === "glory").length,
    shame: achievements.filter((a) => a.type === "shame").length,
    neutral: achievements.filter((a) => a.type === "neutral").length,
    total: achievements.length
  };
}

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const playerId = parseInt(id || "0");
  const player = await db.users.findById(playerId);
  if (!player) {
    return Astro2.redirect("/players");
  }
  const participations = await db.participants.findByPlayerId(playerId);
  const totalMatches = participations.length;
  const wins = participations.filter((p) => p.isWinner).length;
  const winRate = totalMatches > 0 ? Math.round(wins / totalMatches * 100) : 0;
  const civStatsMap = /* @__PURE__ */ new Map();
  for (const p of participations) {
    const current = civStatsMap.get(p.civilization) || { count: 0, wins: 0 };
    current.count++;
    if (p.isWinner) current.wins++;
    civStatsMap.set(p.civilization, current);
  }
  const civStats = Array.from(civStatsMap.entries()).map(([civilization, stats]) => ({ civilization, ...stats })).sort((a, b) => b.count - a.count);
  const allMatches = await db.matches.findAll();
  const recentMatches = participations.map((p) => {
    const match = allMatches.find((m) => m.id === p.matchId);
    return match ? {
      matchId: match.id,
      matchType: match.matchType,
      playedAt: match.playedAt,
      civilization: p.civilization,
      isWinner: p.isWinner,
      eloChange: p.eloChange
    } : null;
  }).filter(Boolean).sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()).slice(0, 10);
  const streak = await getPlayerStreak(playerId);
  const { nemesis, victim } = await getNemesisAndVictim(playerId);
  const fullStats = await getPlayerFullStats(playerId);
  const achievements = await getPlayerAchievements(playerId);
  const achievementCounts = countAchievementsByType(achievements);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": player.username }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <!-- Player Header --> <div class="aoe-panel"> <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"> <div class="flex items-center gap-4"> <div class="w-20 h-20 rounded-full bg-gradient-to-br from-aoe-gold via-amber-500 to-amber-700 flex items-center justify-center text-4xl border-4 border-aoe-gold shadow-lg"> ${getCivilizationFlag(player.favoriteCiv)} </div> <div> <h1 class="aoe-title text-3xl mb-1">${player.username}</h1> <p class="text-aoe-cream-dark text-sm"> ${getCivilizationName(player.favoriteCiv)} </p> <p${addAttribute(`text-lg font-semibold ${getTierColor(player.eloRating)}`, "class")}> ${getRatingTier(player.eloRating)} </p> </div> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(player.eloRating)}</div> <div class="aoe-stat-label">ELO 1v1</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${totalMatches}</div> <div class="aoe-stat-label">Partidas</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-green-400">${wins}</div> <div class="aoe-stat-label">Victorias</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${winRate}%</div> <div class="aoe-stat-label">Win Rate</div> </div> </div> </div> <!-- Racha Actual Mejorada --> ${streak.type !== "none" && streak.count >= 2 && renderTemplate`<div${addAttribute(`mt-4 pt-4 border-t border-aoe-gold/20 ${streak.type === "win" ? "bg-green-900/10" : "bg-red-900/10"} -mx-4 px-4 pb-4 rounded-b`, "class")}> <div class="flex items-center justify-between"> <div class="flex items-center gap-3"> <span class="text-4xl">${streak.type === "win" ? "\u{1F525}" : "\u{1F4A9}"}</span> <div> <p${addAttribute(`font-bold text-lg ${streak.type === "win" ? "text-green-400" : "text-red-400"}`, "class")}> ${streak.frase} </p> <p class="text-aoe-cream-dark text-sm"> ${streak.count} ${streak.type === "win" ? "victorias" : "derrotas"} seguidas
</p> </div> </div> <div${addAttribute(`text-5xl font-cinzel ${streak.type === "win" ? "text-green-400" : "text-red-400"}`, "class")}> ${streak.count} </div> </div> </div>`} </div> <!-- Némesis y Víctima --> ${(nemesis || victim) && renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 gap-4"> ${nemesis && renderTemplate`<div class="aoe-panel border-red-500/30 bg-gradient-to-br from-red-900/20 to-transparent"> <div class="flex items-center gap-4"> <div class="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center text-3xl border-2 border-red-500">
😈
</div> <div class="flex-1"> <h3 class="text-red-400 text-sm uppercase tracking-wider">Tu Némesis</h3> <a${addAttribute(`/players/${nemesis.playerId}`, "href")} class="block"> <span class="text-xl font-cinzel text-red-400 hover:text-red-300">${nemesis.name}</span> </a> <p class="text-aoe-cream-dark text-sm"> ${nemesis.name} ${nemesis.frase} (${nemesis.wins}-${nemesis.losses})
</p> </div> </div> </div>`} ${victim && renderTemplate`<div class="aoe-panel border-green-500/30 bg-gradient-to-br from-green-900/20 to-transparent"> <div class="flex items-center gap-4"> <div class="w-16 h-16 rounded-full bg-green-900/50 flex items-center justify-center text-3xl border-2 border-green-500">
👶
</div> <div class="flex-1"> <h3 class="text-green-400 text-sm uppercase tracking-wider">Tu Víctima</h3> <a${addAttribute(`/players/${victim.playerId}`, "href")} class="block"> <span class="text-xl font-cinzel text-green-400 hover:text-green-300">${victim.name}</span> </a> <p class="text-aoe-cream-dark text-sm"> ${victim.name} ${victim.frase} (${victim.wins}-${victim.losses})
</p> </div> </div> </div>`} </div>`} <!-- Logros --> ${achievements.length > 0 && renderTemplate`<div class="aoe-panel"> <div class="flex items-center justify-between mb-4"> <h2 class="aoe-title text-xl">🏆 Logros Desbloqueados</h2> <div class="flex gap-2 text-sm"> <span class="text-green-400">${achievementCounts.glory} gloria</span> <span class="text-aoe-cream-dark">|</span> <span class="text-red-400">${achievementCounts.shame} vergüenza</span> </div> </div> <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"> ${achievements.map((achievement) => renderTemplate`<div${addAttribute(`p-3 rounded border ${achievement.type === "glory" ? "bg-green-900/20 border-green-500/30" : achievement.type === "shame" ? "bg-red-900/20 border-red-500/30" : "bg-aoe-dark/50 border-aoe-gold/20"}`, "class")}> <div class="flex items-center gap-2 mb-1"> <span class="text-2xl">${achievement.icon}</span> <span${addAttribute(`font-semibold text-sm ${achievement.type === "glory" ? "text-green-400" : achievement.type === "shame" ? "text-red-400" : "text-aoe-gold"}`, "class")}> ${achievement.name} </span> </div> <p class="text-xs text-aoe-cream-dark">${achievement.description}</p> </div>`)} </div> </div>`} <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> <!-- Civilization Stats --> <div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">🏛️ Civilizaciones</h2> ${civStats.length === 0 ? renderTemplate`<p class="text-aoe-cream-dark text-center py-4">Sin partidas registradas</p>` : renderTemplate`<div class="space-y-3"> ${civStats.map((civ) => {
    const civWinRate = civ.count > 0 ? Math.round(civ.wins / civ.count * 100) : 0;
    return renderTemplate`<div class="flex items-center justify-between p-2 bg-aoe-dark/50 rounded"> <span class="text-aoe-cream">${getCivilizationName(civ.civilization)}</span> <div class="flex items-center gap-4"> <span class="text-sm text-aoe-cream-dark">${civ.count} partidas</span> <span${addAttribute(`text-sm font-semibold ${civWinRate >= 50 ? "text-green-400" : "text-red-400"}`, "class")}> ${civWinRate}% WR
</span> </div> </div>`;
  })} </div>`} </div> <!-- Quick Stats --> <div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">📊 Estadísticas</h2> <div class="grid grid-cols-2 gap-4"> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(player.eloTeams)}</div> <div class="aoe-stat-label">ELO Equipos</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(player.eloFfa)}</div> <div class="aoe-stat-label">ELO FFA</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-green-400">${fullStats.maxWinStreak}</div> <div class="aoe-stat-label">Mejor Racha W</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-red-400">${fullStats.maxLossStreak}</div> <div class="aoe-stat-label">Peor Racha L</div> </div> </div> <a${addAttribute(`/head-to-head?player1=${playerId}`, "href")} class="block text-center mt-4 text-aoe-gold hover:text-aoe-gold-light text-sm">
Ver enfrentamientos →
</a> </div> </div> <!-- Recent Matches --> <div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">📜 Partidas Recientes</h2> ${recentMatches.length === 0 ? renderTemplate`<p class="text-aoe-cream-dark text-center py-4">Sin partidas registradas</p>` : renderTemplate`<div class="overflow-x-auto"> <table class="aoe-table"> <thead> <tr> <th>Fecha</th> <th>Tipo</th> <th>Civilización</th> <th class="text-center">Resultado</th> <th class="text-center">ELO</th> </tr> </thead> <tbody> ${recentMatches.map((match) => renderTemplate`<tr> <td class="text-aoe-cream-dark"> ${match.playedAt ? new Date(match.playedAt).toLocaleDateString("es") : "-"} </td> <td>${match.matchType}</td> <td>${getCivilizationName(match.civilization)}</td> <td class="text-center"> <span${addAttribute(`aoe-badge ${match.isWinner ? "aoe-badge-win" : "aoe-badge-loss"}`, "class")}> ${match.isWinner ? "Victoria" : "Derrota"} </span> </td> <td${addAttribute(`text-center font-semibold ${(match.eloChange || 0) >= 0 ? "text-green-400" : "text-red-400"}`, "class")}> ${match.eloChange && match.eloChange > 0 ? "+" : ""}${match.eloChange ? Math.round(match.eloChange) : 0} </td> </tr>`)} </tbody> </table> </div>`} </div> <a href="/players" class="inline-block text-aoe-gold hover:text-aoe-gold-light">
← Volver a jugadores
</a> </div> ` })}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/players/[id].astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/players/[id].astro";
const $$url = "/players/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
