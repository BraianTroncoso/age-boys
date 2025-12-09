/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../chunks/index_Bw9JdCU_.mjs';
import { g as getCivilizationName } from '../chunks/civilizations_BrVbslyX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$HeadToHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$HeadToHead;
  const players = await db.users.findAll();
  const url = new URL(Astro2.request.url);
  const player1Id = parseInt(url.searchParams.get("player1") || url.searchParams.get("player") || "0");
  const player2Id = parseInt(url.searchParams.get("player2") || "0");
  let h2hData = null;
  if (player1Id && player2Id && player1Id !== player2Id) {
    const player1 = await db.users.findById(player1Id);
    const player2 = await db.users.findById(player2Id);
    if (player1 && player2) {
      const allMatchesRaw = await db.matches.findAll();
      const allMatches = allMatchesRaw.filter((m) => m.matchType === "1v1").sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
      const matchDetails = [];
      for (const match of allMatches) {
        const participants = await db.participants.findByMatchId(match.id);
        const p1Data = participants.find((p) => p.playerId === player1Id);
        const p2Data = participants.find((p) => p.playerId === player2Id);
        if (p1Data && p2Data) {
          matchDetails.push({
            matchId: match.id,
            playedAt: match.playedAt,
            player1: {
              playerId: p1Data.playerId,
              civilization: p1Data.civilization,
              isWinner: p1Data.isWinner,
              eloChange: p1Data.eloChange
            },
            player2: {
              playerId: p2Data.playerId,
              civilization: p2Data.civilization,
              isWinner: p2Data.isWinner,
              eloChange: p2Data.eloChange
            }
          });
        }
      }
      const player1Wins = matchDetails.filter((m) => m.player1?.isWinner).length;
      const player2Wins = matchDetails.filter((m) => m.player2?.isWinner).length;
      h2hData = {
        player1,
        player2,
        matches: matchDetails,
        player1Wins,
        player2Wins,
        total: matchDetails.length
      };
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Head-to-Head" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="text-center"> <h1 class="aoe-title text-3xl mb-2">Head-to-Head</h1> <p class="text-aoe-cream-dark">Compara el historial entre dos jugadores</p> </div> <!-- Player Selection --> <div class="aoe-panel"> <form method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"> <div> <label class="block text-sm font-semibold text-aoe-cream mb-2">
Jugador 1
</label> <select name="player1" class="aoe-select" required> <option value="">Seleccionar jugador</option> ${players.map((p) => renderTemplate`<option${addAttribute(p.id, "value")}${addAttribute(p.id === player1Id, "selected")}>${p.username}</option>`)} </select> </div> <div class="text-center text-aoe-gold text-2xl font-cinzel hidden md:block">
VS
</div> <div> <label class="block text-sm font-semibold text-aoe-cream mb-2">
Jugador 2
</label> <select name="player2" class="aoe-select" required> <option value="">Seleccionar jugador</option> ${players.map((p) => renderTemplate`<option${addAttribute(p.id, "value")}${addAttribute(p.id === player2Id, "selected")}>${p.username}</option>`)} </select> </div> <div class="md:col-span-3"> <button type="submit" class="aoe-btn-primary w-full md:w-auto">
Comparar
</button> </div> </form> </div>  ${!h2hData && !player1Id && !player2Id && renderTemplate`<div class="aoe-panel text-center py-12"> <span class="text-6xl mb-4 block">⚔️</span> <h2 class="aoe-title text-xl mb-2">Selecciona dos jugadores</h2> <p class="text-aoe-cream-dark">
Elige dos jugadores para ver su historial de enfrentamientos
</p> </div>`}  ${player1Id && player2Id && player1Id === player2Id && renderTemplate`<div class="aoe-panel text-center py-8"> <span class="text-4xl mb-4 block">🤔</span> <p class="text-aoe-cream-dark">
Selecciona dos jugadores diferentes para comparar
</p> </div>`}  ${h2hData && renderTemplate`<div class="space-y-6">  <div class="aoe-panel"> <div class="grid grid-cols-3 gap-4 items-center"> <div class="text-center"> <a${addAttribute(`/players/${h2hData.player1.id}`, "href")} class="aoe-title text-2xl hover:text-aoe-gold-light block"> ${h2hData.player1.username} </a> <p class="text-aoe-cream-dark text-sm">
ELO: ${Math.round(h2hData.player1.eloRating)} </p> </div> <div class="text-center"> <div class="flex items-center justify-center gap-4 text-4xl font-cinzel"> <span${addAttribute(h2hData.player1Wins > h2hData.player2Wins ? "text-green-400" : "text-aoe-cream", "class")}> ${h2hData.player1Wins} </span> <span class="text-aoe-gold">-</span> <span${addAttribute(h2hData.player2Wins > h2hData.player1Wins ? "text-green-400" : "text-aoe-cream", "class")}> ${h2hData.player2Wins} </span> </div> <p class="text-aoe-cream-dark text-sm mt-2"> ${h2hData.total} partidas jugadas
</p> </div> <div class="text-center"> <a${addAttribute(`/players/${h2hData.player2.id}`, "href")} class="aoe-title text-2xl hover:text-aoe-gold-light block"> ${h2hData.player2.username} </a> <p class="text-aoe-cream-dark text-sm">
ELO: ${Math.round(h2hData.player2.eloRating)} </p> </div> </div>  ${h2hData.total > 0 && renderTemplate`<div class="mt-6"> <div class="h-4 rounded-full overflow-hidden flex bg-aoe-dark"> <div class="bg-gradient-to-r from-green-600 to-green-400 transition-all"${addAttribute(`width: ${h2hData.player1Wins / h2hData.total * 100}%`, "style")}></div> <div class="bg-gradient-to-r from-red-400 to-red-600 transition-all"${addAttribute(`width: ${h2hData.player2Wins / h2hData.total * 100}%`, "style")}></div> </div> <div class="flex justify-between mt-2 text-sm"> <span class="text-green-400"> ${Math.round(h2hData.player1Wins / h2hData.total * 100)}% Win Rate
</span> <span class="text-red-400"> ${Math.round(h2hData.player2Wins / h2hData.total * 100)}% Win Rate
</span> </div> </div>`} </div>  ${h2hData.matches.length > 0 ? renderTemplate`<div class="aoe-panel"> <h2 class="aoe-title text-xl mb-4">📜 Historial de Enfrentamientos</h2> <div class="overflow-x-auto"> <table class="aoe-table"> <thead> <tr> <th>Fecha</th> <th>${h2hData.player1.username}</th> <th class="text-center">Resultado</th> <th>${h2hData.player2.username}</th> </tr> </thead> <tbody> ${h2hData.matches.map((match) => renderTemplate`<tr> <td class="text-aoe-cream-dark"> ${match.playedAt ? new Date(match.playedAt).toLocaleDateString("es") : "-"} </td> <td> <span${addAttribute(match.player1?.isWinner ? "text-green-400" : "text-red-400", "class")}> ${getCivilizationName(match.player1?.civilization || "")} </span> <span class="text-xs text-aoe-cream-dark ml-2">
(${match.player1?.eloChange && match.player1.eloChange > 0 ? "+" : ""}${match.player1?.eloChange ? Math.round(match.player1.eloChange) : 0})
</span> </td> <td class="text-center"> <span${addAttribute(`aoe-badge ${match.player1?.isWinner ? "aoe-badge-win" : "aoe-badge-loss"}`, "class")}> ${match.player1?.isWinner ? "\u{1F3C6}" : "\u{1F480}"} </span> <span class="mx-2 text-aoe-gold">vs</span> <span${addAttribute(`aoe-badge ${match.player2?.isWinner ? "aoe-badge-win" : "aoe-badge-loss"}`, "class")}> ${match.player2?.isWinner ? "\u{1F3C6}" : "\u{1F480}"} </span> </td> <td> <span${addAttribute(match.player2?.isWinner ? "text-green-400" : "text-red-400", "class")}> ${getCivilizationName(match.player2?.civilization || "")} </span> <span class="text-xs text-aoe-cream-dark ml-2">
(${match.player2?.eloChange && match.player2.eloChange > 0 ? "+" : ""}${match.player2?.eloChange ? Math.round(match.player2.eloChange) : 0})
</span> </td> </tr>`)} </tbody> </table> </div> </div>` : renderTemplate`<div class="aoe-panel text-center py-8"> <span class="text-4xl mb-4 block">🤷</span> <p class="text-aoe-cream-dark">
Estos jugadores no han jugado partidas 1v1 entre ellos
</p> </div>`} </div>`} </div> ` })}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/head-to-head.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/head-to-head.astro";
const $$url = "/head-to-head";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HeadToHead,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
