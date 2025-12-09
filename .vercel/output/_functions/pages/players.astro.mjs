/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../chunks/index_Bw9JdCU_.mjs';
import { g as getRatingTier, d as getTierColor } from '../chunks/elo_CBX70JZL.mjs';
import { i as isAdmin } from '../chunks/auth_8NtHwdxo.mjs';
import { b as getCivilization } from '../chunks/civilizations_BrVbslyX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const currentUser = Astro2.locals.user;
  const userIsAdmin = isAdmin(currentUser);
  const players = await db.users.findAll();
  const playersWithStats = [];
  for (const player of players) {
    const participations = await db.participants.findByPlayerId(player.id);
    const wins = participations.filter((p) => p.isWinner).length;
    const favCiv = getCivilization(player.favoriteCiv);
    playersWithStats.push({
      ...player,
      totalMatches: participations.length,
      wins,
      civFlag: favCiv?.flag || "\u2694\uFE0F"
    });
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Jugadores" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <div class="flex justify-between items-center"> <div> <h1 class="aoe-title text-3xl mb-2">Jugadores</h1> <p class="text-aoe-cream-dark">${playersWithStats.length} jugadores registrados</p> </div> ${userIsAdmin && renderTemplate`<button id="addPlayerBtn" class="aoe-btn-primary">
+ Nuevo Jugador
</button>`} </div> <div id="addPlayerModal" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50"> <div class="aoe-panel w-full max-w-md mx-4"> <h2 class="aoe-title text-2xl mb-6">Nuevo Jugador</h2> <form id="addPlayerForm" class="space-y-4"> <div> <label for="playerName" class="block text-sm font-semibold text-aoe-cream mb-2">
Nombre del Jugador
</label> <input type="text" id="playerName" name="name" required minlength="2" maxlength="30" class="aoe-input" placeholder="Nombre de guerra"> </div> <div id="addPlayerError" class="hidden text-red-400 text-sm"></div> <div class="flex gap-4"> <button type="button" id="cancelAddPlayer" class="aoe-btn flex-1">Cancelar</button> <button type="submit" class="aoe-btn-primary flex-1">Crear Jugador</button> </div> </form> </div> </div> ${playersWithStats.length === 0 ? renderTemplate`<div class="aoe-panel text-center py-12"> <span class="text-6xl mb-4 block">👥</span> <h2 class="aoe-title text-xl mb-2">No hay jugadores</h2> <p class="text-aoe-cream-dark mb-4">Agrega jugadores para empezar a registrar partidas</p> </div>` : renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${playersWithStats.map((player, index) => renderTemplate`<a${addAttribute(`/players/${player.id}`, "href")} class="aoe-card hover:shadow-gold-lg transition-shadow group"> <div class="flex items-start justify-between mb-4"> <div> <div class="text-2xl mb-1"> ${index === 0 ? "\u{1F947}" : index === 1 ? "\u{1F948}" : index === 2 ? "\u{1F949}" : player.civFlag} </div> <h3 class="font-cinzel text-xl text-aoe-cream group-hover:text-aoe-gold transition-colors">${player.username}</h3> <p${addAttribute(`text-sm ${getTierColor(player.eloRating)}`, "class")}>${getRatingTier(player.eloRating)}</p> </div> <div class="text-right"> <div class="aoe-stat-value">${Math.round(player.eloRating)}</div> <div class="text-xs text-aoe-cream-dark">ELO</div> </div> </div> <div class="grid grid-cols-3 gap-2"> <div class="aoe-stat"> <div class="aoe-stat-value text-lg">${player.totalMatches}</div> <div class="aoe-stat-label">Partidas</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-lg text-green-400">${player.wins}</div> <div class="aoe-stat-label">Victorias</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-lg"> ${player.totalMatches > 0 ? Math.round(player.wins / player.totalMatches * 100) : 0}%
</div> <div class="aoe-stat-label">Win Rate</div> </div> </div> </a>`)} </div>`} </div> ` })} ${renderScript($$result, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/players/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/players/index.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/players/index.astro";
const $$url = "/players";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
