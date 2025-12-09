/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, o as Fragment, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../chunks/index_Bw9JdCU_.mjs';
import { g as getCivilizationName } from '../chunks/civilizations_BrVbslyX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const ITEMS_PER_PAGE = 5;
  const currentPage = parseInt(Astro2.url.searchParams.get("page") || "1");
  const allMatchesRaw = await db.matches.findAll();
  const allMatches = allMatchesRaw.sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );
  const totalMatches = allMatches.length;
  const totalPages = Math.ceil(totalMatches / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedMatches = allMatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const matchesWithParticipants = [];
  for (const match of paginatedMatches) {
    const rawParticipants = await db.participants.findByMatchId(match.id);
    const participants = [];
    for (const p of rawParticipants) {
      const player = await db.users.findById(p.playerId);
      participants.push({ ...p, playerName: player?.username || "Unknown" });
    }
    matchesWithParticipants.push({ ...match, participants });
  }
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (validPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages);
      }
    }
    return pages;
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Historial de Partidas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="text-center"> <h1 class="aoe-title text-3xl mb-2">Historial de Partidas</h1> <p class="text-aoe-cream-dark mb-4">${totalMatches} partidas registradas</p> <a href="/matches/new" class="aoe-btn-primary">+ Nueva Partida</a> </div> ${totalMatches === 0 ? renderTemplate`<div class="aoe-panel text-center py-12"> <span class="text-6xl mb-4 block">📜</span> <h2 class="aoe-title text-xl mb-2">Sin partidas</h2> <p class="text-aoe-cream-dark mb-4">No hay partidas registradas aún</p> <a href="/matches/new" class="aoe-btn-primary inline-block">Registrar Primera Partida</a> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="space-y-4"> ${matchesWithParticipants.map((match) => {
    const winners = match.participants.filter((p) => p.isWinner);
    const losers = match.participants.filter((p) => !p.isWinner);
    return renderTemplate`<div class="aoe-panel"> <div class="flex justify-between items-start mb-4"> <div class="flex items-center gap-4"> <span class="text-2xl">${match.matchType === "1v1" ? "\u2694\uFE0F" : match.matchType === "ffa" ? "\u{1F451}" : "\u2694\uFE0F\u2694\uFE0F"}</span> <div> <span class="font-cinzel text-lg text-aoe-gold uppercase">${match.matchType}</span> <p class="text-sm text-aoe-cream-dark">${new Date(match.playedAt).toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p> </div> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div class="bg-green-900/20 border border-green-500/30 rounded p-4"> <h4 class="text-green-400 font-semibold mb-3 flex items-center gap-2"> <span>🏆</span>${winners.length > 1 ? "Equipo Ganador" : "Ganador"} </h4> <div class="space-y-2"> ${winners.map((p) => renderTemplate`<div class="flex justify-between items-center"> <div> <a${addAttribute(`/players/${p.playerId}`, "href")} class="text-aoe-cream hover:text-aoe-gold">${p.playerName}</a> <span class="text-xs text-aoe-cream-dark ml-2">(${getCivilizationName(p.civilization)})</span> </div> <span class="text-green-400 text-sm font-semibold">+${Math.round(p.eloChange)}</span> </div>`)} </div> </div> <div class="bg-red-900/20 border border-red-500/30 rounded p-4"> <h4 class="text-red-400 font-semibold mb-3 flex items-center gap-2"> <span>💀</span>${losers.length > 1 ? match.matchType === "ffa" ? "Perdedores" : "Equipo Perdedor" : "Perdedor"} </h4> <div class="space-y-2"> ${losers.map((p) => renderTemplate`<div class="flex justify-between items-center"> <div> <a${addAttribute(`/players/${p.playerId}`, "href")} class="text-aoe-cream hover:text-aoe-gold">${p.playerName}</a> <span class="text-xs text-aoe-cream-dark ml-2">(${getCivilizationName(p.civilization)})</span> </div> <span class="text-red-400 text-sm font-semibold">${Math.round(p.eloChange)}</span> </div>`)} </div> </div> </div> </div>`;
  })} </div> ${totalPages > 1 && renderTemplate`<div class="flex justify-center items-center gap-2 mt-8"> ${validPage > 1 ? renderTemplate`<a${addAttribute(`/matches?page=${validPage - 1}`, "href")} class="px-3 py-2 rounded bg-aoe-dark border border-aoe-gold/30 text-aoe-cream hover:bg-aoe-gold/20 transition-colors">
← Anterior
</a>` : renderTemplate`<span class="px-3 py-2 rounded bg-aoe-dark/50 border border-aoe-gold/10 text-aoe-cream-dark cursor-not-allowed">
← Anterior
</span>`} <div class="flex gap-1"> ${getPageNumbers().map((page) => typeof page === "number" ? renderTemplate`<a${addAttribute(`/matches?page=${page}`, "href")}${addAttribute(`w-10 h-10 flex items-center justify-center rounded border transition-colors ${page === validPage ? "bg-aoe-gold text-aoe-dark font-bold border-aoe-gold" : "bg-aoe-dark border-aoe-gold/30 text-aoe-cream hover:bg-aoe-gold/20"}`, "class")}> ${page} </a>` : renderTemplate`<span class="w-10 h-10 flex items-center justify-center text-aoe-cream-dark"> ${page} </span>`)} </div> ${validPage < totalPages ? renderTemplate`<a${addAttribute(`/matches?page=${validPage + 1}`, "href")} class="px-3 py-2 rounded bg-aoe-dark border border-aoe-gold/30 text-aoe-cream hover:bg-aoe-gold/20 transition-colors">
Siguiente →
</a>` : renderTemplate`<span class="px-3 py-2 rounded bg-aoe-dark/50 border border-aoe-gold/10 text-aoe-cream-dark cursor-not-allowed">
Siguiente →
</span>`} </div>`}${totalPages > 1 && renderTemplate`<p class="text-center text-aoe-cream-dark text-sm">
Pagina ${validPage} de ${totalPages} </p>`}` })}`} </div> ` })}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/matches/index.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/matches/index.astro";
const $$url = "/matches";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
