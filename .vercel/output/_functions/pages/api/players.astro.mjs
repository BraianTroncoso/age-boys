import { d as db } from '../../chunks/index_Bw9JdCU_.mjs';
import { i as isAdmin, h as hashPassword } from '../../chunks/auth_8NtHwdxo.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    if (!isAdmin(locals.user)) {
      return new Response(JSON.stringify({ success: false, error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { name } = body;
    if (!name || name.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: "El nombre debe tener al menos 2 caracteres" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingUser = await db.users.findByUsername(name.trim());
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: "Ya existe un jugador con ese nombre" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const passwordHash = await hashPassword("guest123");
    const player = await db.users.create({
      username: name.trim(),
      passwordHash,
      favoriteCiv: "spanish"
    });
    return new Response(JSON.stringify({ success: true, player }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Create player error:", error);
    return new Response(JSON.stringify({ success: false, error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  try {
    const players = await db.users.findAll();
    return new Response(JSON.stringify({ success: true, players }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
