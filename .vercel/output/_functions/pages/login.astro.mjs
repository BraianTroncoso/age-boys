/* empty css                                        */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Ctxpu_nC.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_nzRoMys9.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  if (Astro2.locals.user) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Iniciar Sesi\xF3n" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[80vh] flex items-center justify-center"> <div class="aoe-panel w-full max-w-md"> <div class="text-center mb-8"> <span class="text-5xl mb-4 block">⚔️</span> <h1 class="aoe-title text-3xl mb-2">AoE3 Tracker</h1> <p class="text-aoe-cream-dark">Inicia sesión para continuar</p> </div> <form id="loginForm" class="space-y-6"> <div> <label for="username" class="block text-sm font-semibold text-aoe-cream mb-2">
Usuario
</label> <input type="text" id="username" name="username" required class="aoe-input" placeholder="Tu nombre de usuario"> </div> <div> <label for="password" class="block text-sm font-semibold text-aoe-cream mb-2">
Contraseña
</label> <input type="password" id="password" name="password" required class="aoe-input" placeholder="••••••••"> </div> <div id="error" class="hidden text-red-400 text-sm text-center p-2 bg-red-900/20 rounded"></div> <button type="submit" class="aoe-btn-primary w-full">
Entrar al Campo de Batalla
</button> </form> <p class="text-center mt-6 text-aoe-cream-dark">
¿No tienes cuenta?
<a href="/register" class="text-aoe-gold hover:text-aoe-gold-light transition-colors">
Regístrate
</a> </p> </div> </div> ` })} ${renderScript($$result, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/login.astro", void 0);

const $$file = "C:/Users/tronc/OneDrive/Escritorio/proyects/proyect-two/age-boys/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
