import { defineMiddleware } from 'astro:middleware';
import { getUserFromSession, SESSION_COOKIE } from './lib/auth';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/session', '/api/auth/logout'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return next();
  }

  const cookie = context.cookies.get(SESSION_COOKIE)?.value;
  const user = await getUserFromSession(cookie);

  context.locals.user = user;

  if (!user && !pathname.startsWith('/api/')) {
    return context.redirect('/login');
  }

  return next();
});
