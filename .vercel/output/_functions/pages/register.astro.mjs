/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
import { c as civilizations } from '../chunks/civilizations_BrVbslyX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Register;
  if (Astro2.locals.user) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Registro" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[80vh] flex items-center justify-center"> <div class="aoe-panel w-full max-w-md"> <div class="text-center mb-8"> <span class="text-5xl mb-4 block">🏰</span> <h1 class="aoe-title text-3xl mb-2">Únete a la Batalla</h1> <p class="text-aoe-cream-dark">Crea tu cuenta para registrar partidas</p> </div> <form id="registerForm" class="space-y-6"> <div> <label for="username" class="block text-sm font-semibold text-aoe-cream mb-2">
Usuario
</label> <input type="text" id="username" name="username" required minlength="3" maxlength="20" class="aoe-input" placeholder="Elige tu nombre de guerra"> </div> <div> <label for="password" class="block text-sm font-semibold text-aoe-cream mb-2">
Contraseña
</label> <input type="password" id="password" name="password" required minlength="4" class="aoe-input" placeholder="Mínimo 4 caracteres"> </div> <div> <label for="confirmPassword" class="block text-sm font-semibold text-aoe-cream mb-2">
Confirmar Contraseña
</label> <input type="password" id="confirmPassword" name="confirmPassword" required class="aoe-input" placeholder="Repite la contraseña"> </div> <div> <label for="favoriteCiv" class="block text-sm font-semibold text-aoe-cream mb-2">
Civilización Favorita
</label> <select id="favoriteCiv" name="favoriteCiv" required class="aoe-select"> ${civilizations.map((civ) => renderTemplate`<option${addAttribute(civ.id, "value")}>${civ.flag} ${civ.name}</option>`)} </select> </div> <div id="error" class="hidden text-red-400 text-sm text-center p-2 bg-red-900/20 rounded"></div> <button type="submit" class="aoe-btn-primary w-full">
Crear Cuenta
</button> </form> <p class="text-center mt-6 text-aoe-cream-dark">
¿Ya tienes cuenta?
<a href="/login" class="text-aoe-gold hover:text-aoe-gold-light transition-colors">
Inicia sesión
</a> </p> </div> </div> ` })} ${renderScript($$result, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/register.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/register.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
