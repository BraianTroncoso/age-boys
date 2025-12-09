import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_ChWHTjjo.mjs';
import { manifest } from './manifest_uFsXsVHW.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/logout.astro.mjs');
const _page3 = () => import('./pages/api/auth/register.astro.mjs');
const _page4 = () => import('./pages/api/matches.astro.mjs');
const _page5 = () => import('./pages/api/players.astro.mjs');
const _page6 = () => import('./pages/api/profile.astro.mjs');
const _page7 = () => import('./pages/head-to-head.astro.mjs');
const _page8 = () => import('./pages/login.astro.mjs');
const _page9 = () => import('./pages/matches/new.astro.mjs');
const _page10 = () => import('./pages/matches.astro.mjs');
const _page11 = () => import('./pages/players/_id_.astro.mjs');
const _page12 = () => import('./pages/players.astro.mjs');
const _page13 = () => import('./pages/profile.astro.mjs');
const _page14 = () => import('./pages/register.astro.mjs');
const _page15 = () => import('./pages/reglas.astro.mjs');
const _page16 = () => import('./pages/ruleta.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/login.ts", _page1],
    ["src/pages/api/auth/logout.ts", _page2],
    ["src/pages/api/auth/register.ts", _page3],
    ["src/pages/api/matches.ts", _page4],
    ["src/pages/api/players.ts", _page5],
    ["src/pages/api/profile.ts", _page6],
    ["src/pages/head-to-head.astro", _page7],
    ["src/pages/login.astro", _page8],
    ["src/pages/matches/new.astro", _page9],
    ["src/pages/matches/index.astro", _page10],
    ["src/pages/players/[id].astro", _page11],
    ["src/pages/players/index.astro", _page12],
    ["src/pages/profile.astro", _page13],
    ["src/pages/register.astro", _page14],
    ["src/pages/reglas.astro", _page15],
    ["src/pages/ruleta.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "72abb540-b12f-4078-9abc-889e807f626d",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
