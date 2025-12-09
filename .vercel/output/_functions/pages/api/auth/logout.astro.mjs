import { S as SESSION_COOKIE } from '../../../chunks/auth_8NtHwdxo.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/login",
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
