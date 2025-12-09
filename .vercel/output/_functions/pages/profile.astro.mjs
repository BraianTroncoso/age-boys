/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { d as db } from '../chunks/index_Bw9JdCU_.mjs';
import { c as civilizations } from '../chunks/civilizations_BrVbslyX.mjs';
import { g as getRatingTier, d as getTierColor } from '../chunks/elo_CBX70JZL.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Profile;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/login");
  }
  const participations = await db.participants.findByPlayerId(user.id);
  const totalMatches = participations.length;
  const wins = participations.filter((p) => p.isWinner).length;
  const winRate = totalMatches > 0 ? Math.round(wins / totalMatches * 100) : 0;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mi Perfil" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto space-y-8"> <div class="text-center"> <h1 class="aoe-title text-3xl mb-2">Mi Perfil</h1> <p class="text-aoe-cream-dark">Gestiona tu información de jugador</p> </div> <div class="aoe-panel"> <div class="flex items-center gap-6 mb-6"> <div class="w-20 h-20 rounded-full bg-aoe-gold/20 flex items-center justify-center text-4xl border-2 border-aoe-gold"> ${civilizations.find((c) => c.id === user.favoriteCiv)?.flag || "\u2694\uFE0F"} </div> <div> <h2 class="aoe-title text-2xl">${user.username}</h2> <p${addAttribute(`${getTierColor(user.eloRating)}`, "class")}>${getRatingTier(user.eloRating)}</p> </div> </div> <div class="grid grid-cols-3 gap-4 mb-6"> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(user.eloRating)}</div> <div class="aoe-stat-label">ELO 1v1</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(user.eloTeams)}</div> <div class="aoe-stat-label">ELO Equipos</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${Math.round(user.eloFfa)}</div> <div class="aoe-stat-label">ELO FFA</div> </div> </div> <div class="grid grid-cols-3 gap-4 mb-6"> <div class="aoe-stat"> <div class="aoe-stat-value">${totalMatches}</div> <div class="aoe-stat-label">Partidas</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value text-green-400">${wins}</div> <div class="aoe-stat-label">Victorias</div> </div> <div class="aoe-stat"> <div class="aoe-stat-value">${winRate}%</div> <div class="aoe-stat-label">Win Rate</div> </div> </div> </div> <div class="aoe-panel"> <h3 class="aoe-title text-xl mb-4">Editar Perfil</h3> <form id="profileForm" class="space-y-4"> <div> <label for="favoriteCiv" class="block text-sm font-semibold text-aoe-cream mb-2">
Civilizacion Favorita
</label> <select id="favoriteCiv" name="favoriteCiv" class="aoe-select"> ${civilizations.map((civ) => renderTemplate`<option${addAttribute(civ.id, "value")}${addAttribute(civ.id === user.favoriteCiv, "selected")}> ${civ.flag} ${civ.name} </option>`)} </select> </div> <div id="profileMessage" class="hidden text-sm text-center p-2 rounded"></div> <button type="submit" class="aoe-btn-primary w-full">
Guardar Cambios
</button> <a${addAttribute(`/players/${user.id}`, "href")} class="block text-right text-aoe-gold hover:text-aoe-gold-light mt-4">
Ver mi perfil publico →
</a> </form> </div> </div> ` })} ${renderScript($$result, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/profile.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/profile.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
