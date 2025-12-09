import { d as defineMiddleware, s as sequence } from './chunks/index_2BF4pvao.mjs';
import { g as getSessionFromCookies, a as getUserFromSession } from './chunks/auth_8NtHwdxo.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_BANRnQbA.mjs';
import 'piccolore';
import './chunks/astro/server_Ctxpu_nC.mjs';
import 'clsx';

const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return next();
  }
  const cookieHeader = context.request.headers.get("cookie");
  const session = getSessionFromCookies(cookieHeader);
  const user = await getUserFromSession(session);
  context.locals.user = user;
  if (!user && !pathname.startsWith("/api/")) {
    return context.redirect("/login");
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
