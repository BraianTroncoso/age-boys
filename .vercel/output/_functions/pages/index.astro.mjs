/* empty css                                        */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../chunks/index_Bw9JdCU_.mjs';
import { g as getRatingTier, d as getTierColor } from '../chunks/elo_CBX70JZL.mjs';
import { a as getCivilizationFlag, g as getCivilizationName } from '../chunks/civilizations_BrVbslyX.mjs';
import { c as getWeeklyLoser } from '../chunks/stats_GnMgbUak.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const players = await db.users.findAll();
  const allMatchesRaw = await db.matches.findAll();
  const matches = allMatchesRaw.slice(0, 5);
  const weeklyLoser = await getWeeklyLoser();
  const topPlayer = players.length > 0 ? players[0] : null;
  let topPlayerStats = null;
  if (topPlayer) {
    let wins = 0;
    let losses = 0;
    for (const match of allMatchesRaw) {
      const participants = await db.participants.findByMatchId(match.id);
      const playerParticipant = participants.find((p) => p.playerId === topPlayer.id);
      if (playerParticipant) {
        if (playerParticipant.isWinner) wins++;
        else losses++;
      }
    }
    topPlayerStats = {
      wins,
      losses,
      total: wins + losses,
      winRate: wins + losses > 0 ? Math.round(wins / (wins + losses) * 100) : 0
    };
  }
  const frasesTop = [
    "El que tiene la pija m\xE1s grande del grupo",
    "27cm de pura habilidad",
    "El \xFAnico que sabe jugar ac\xE1",
    "Dios del Age, humilde y sencillo",
    "El que te garcha en el Age y en la vida",
    "Poronga at\xF3mica del ranking",
    "El m\xE1s capo, el m\xE1s fachero, el mejor",
    "Se coge a todos sin despeinarse",
    "El que manda en esta mierda",
    "Alfa del grupo, los dem\xE1s son betas",
    "El \xFAnico con neuronas funcionales",
    "Chad supremo del Age of Empires",
    "Tu pap\xE1 en el Age",
    "El que te adopta como hijo"
  ];
  const fraseRandom = frasesTop[Math.floor(Math.random() * frasesTop.length)];
  const matchesWithParticipants = [];
  for (const match of matches) {
    const rawParticipants = await db.participants.findByMatchId(match.id);
    const participants = [];
    for (const p of rawParticipants) {
      const player = await db.users.findById(p.playerId);
      participants.push({ ...p, playerName: player?.username || "Unknown" });
    }
    matchesWithParticipants.push({ ...match, participants });
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Rankings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <!-- Sección del #1 - El Rey --> ${topPlayer && topPlayerStats && renderTemplate`<div class="aoe-panel relative overflow-hidden"> <!-- Fondo decorativo --> <div class="absolute inset-0 bg-gradient-to-r from-aoe-gold/10 via-transparent to-aoe-gold/10"></div> <div class="absolute top-0 left-0 w-32 h-32 bg-aoe-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div> <div class="absolute bottom-0 right-0 w-40 h-40 bg-aoe-gold/5 rounded-full translate-x-1/2 translate-y-1/2"></div> <div class="relative"> <div class="text-center mb-6"> <span class="text-6xl">👑</span> <h2 class="aoe-title text-2xl text-aoe-gold mt-2">EL NÚMERO 1</h2> <p class="text-aoe-cream-dark text-sm italic">"${fraseRandom}"</p> </div> <div class="flex flex-col md:flex-row items-center justify-center gap-8"> <!-- Avatar/Icono grande --> <div class="relative"> <div class="w-32 h-32 rounded-full bg-gradient-to-br from-aoe-gold via-amber-500 to-amber-700 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(218,165,32,0.5)] border-4 border-aoe-gold">
🏆
</div> <div class="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
#1
</div> </div> <!-- Info del jugador --> <div class="text-center md:text-left"> <a${addAttribute(`/players/${topPlayer.id}`, "href")} class="block"> <h3 class="text-4xl font-cinzel text-aoe-gold hover:text-aoe-gold-light transition-colors"> ${topPlayer.username.toUpperCase()} </h3> </a> <p class="text-aoe-cream-dark mt-1"> ${getCivilizationFlag(topPlayer.favoriteCiv)} ${getCivilizationName(topPlayer.favoriteCiv)} </p> <p${addAttribute(`text-lg font-semibold mt-2 ${getTierColor(topPlayer.eloRating)}`, "class")}> ${getRatingTier(topPlayer.eloRating)} </p> </div> <!-- Stats --> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"> <div class="aoe-card px-4 py-3"> <div class="text-3xl font-cinzel text-aoe-gold">${Math.round(topPlayer.eloRating)}</div> <div class="text-xs text-aoe-cream-dark">ELO</div> </div> <div class="aoe-card px-4 py-3"> <div class="text-3xl font-cinzel text-green-400">${topPlayerStats.wins}</div> <div class="text-xs text-aoe-cream-dark">Victorias</div> </div> <div class="aoe-card px-4 py-3"> <div class="text-3xl font-cinzel text-red-400">${topPlayerStats.losses}</div> <div class="text-xs text-aoe-cream-dark">Derrotas</div> </div> <div class="aoe-card px-4 py-3"> <div class="text-3xl font-cinzel text-aoe-cream">${topPlayerStats.winRate}%</div> <div class="text-xs text-aoe-cream-dark">Win Rate</div> </div> </div> </div> <!-- Mensaje motivacional --> <div class="text-center mt-6 pt-4 border-t border-aoe-gold/20"> <p class="text-aoe-cream-dark text-sm">
¿Pensás que podés destronarlo? <a href="/matches/new" class="text-aoe-gold hover:underline">Registrá una partida</a> y demostralo, cagón.
</p> </div> </div> </div>`} <!-- El Boludo de la Semana --> ${weeklyLoser && weeklyLoser.player.id !== topPlayer?.id && renderTemplate`<div class="aoe-panel relative overflow-hidden border-red-500/30 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20"> <div class="relative"> <div class="flex flex-col md:flex-row items-center justify-between gap-6"> <div class="flex items-center gap-4"> <div class="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(239,68,68,0.4)] border-4 border-red-500">
💩
</div> <div> <h3 class="text-sm text-red-400 uppercase tracking-wider">El Boludo de la Semana</h3> <a${addAttribute(`/players/${weeklyLoser.player.id}`, "href")} class="block"> <span class="text-2xl font-cinzel text-red-400 hover:text-red-300"> ${weeklyLoser.player.username.toUpperCase()} </span> </a> <p class="text-aoe-cream-dark text-sm italic">"${weeklyLoser.frase}"</p> </div> </div> <div class="flex gap-4 text-center"> <div class="aoe-card px-4 py-2 border-red-500/30"> <div class="text-2xl font-cinzel text-red-400">${weeklyLoser.losses}</div> <div class="text-xs text-aoe-cream-dark">Derrotas</div> </div> <div class="aoe-card px-4 py-2 border-green-500/30"> <div class="text-2xl font-cinzel text-green-400">${weeklyLoser.wins}</div> <div class="text-xs text-aoe-cream-dark">Victorias</div> </div> </div> </div> </div> </div>`} <div class="text-center"> <h1 class="aoe-title text-4xl mb-2">Clasificación General</h1> <p class="text-aoe-cream-dark">Rankings actualizados en tiempo real</p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2"> <div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">🏆 Rankings 1v1</h2> ${players.length === 0 ? renderTemplate`<div class="text-center py-8 text-aoe-cream-dark"> <p>No hay jugadores registrados aún.</p> <a href="/players" class="text-aoe-gold hover:text-aoe-gold-light">
Agregar jugadores →
</a> </div>` : renderTemplate`<div class="overflow-x-auto"> <table class="aoe-table"> <thead> <tr> <th class="w-16">#</th> <th>Jugador</th> <th class="text-center">ELO</th> <th class="text-center">Rango</th> </tr> </thead> <tbody> ${players.map((player, index) => renderTemplate`<tr> <td class="font-cinzel text-aoe-gold"> ${index === 0 ? "\u{1F947}" : index === 1 ? "\u{1F948}" : index === 2 ? "\u{1F949}" : index + 1} </td> <td> <a${addAttribute(`/players/${player.id}`, "href")} class="hover:text-aoe-gold transition-colors"> ${player.username} </a> </td> <td class="text-center font-semibold text-aoe-gold"> ${Math.round(player.eloRating)} </td> <td${addAttribute(`text-center ${getTierColor(player.eloRating)}`, "class")}> ${getRatingTier(player.eloRating)} </td> </tr>`)} </tbody> </table> </div>`} </div> </div> <div class="lg:col-span-1"> <div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">📜 Partidas Recientes</h2> ${matchesWithParticipants.length === 0 ? renderTemplate`<div class="text-center py-8 text-aoe-cream-dark"> <p>No hay partidas registradas.</p> <a href="/matches/new" class="text-aoe-gold hover:text-aoe-gold-light">
Registrar partida →
</a> </div>` : renderTemplate`<div class="space-y-4"> ${matchesWithParticipants.map((match) => renderTemplate`<div class="aoe-card"> <div class="flex justify-between items-center mb-2"> <span class="text-xs text-aoe-cream-dark uppercase">${match.matchType}</span> <span class="text-xs text-aoe-cream-dark"> ${new Date(match.playedAt).toLocaleDateString("es")} </span> </div> <div class="space-y-1"> ${match.participants.map((p) => renderTemplate`<div${addAttribute(`flex justify-between items-center text-sm ${p.isWinner ? "text-green-400" : "text-red-400"}`, "class")}> <span>${p.playerName}</span> <span class="text-xs"> ${p.eloChange > 0 ? "+" : ""}${Math.round(p.eloChange)} </span> </div>`)} </div> </div>`)} </div>`} <a href="/matches" class="block text-center mt-4 text-aoe-gold hover:text-aoe-gold-light text-sm">
Ver todas las partidas →
</a> </div> </div> </div> </div> ` })}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/index.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
