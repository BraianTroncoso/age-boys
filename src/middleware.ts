import { defineMiddleware } from 'astro:middleware';
import { getSessionFromCookies, getUserFromSession } from './lib/auth';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return next();
  }

  const cookieHeader = context.request.headers.get('cookie');
  const session = getSessionFromCookies(cookieHeader);
  const user = getUserFromSession(session);

  context.locals.user = user;

  if (!user && !pathname.startsWith('/api/')) {
    return context.redirect('/login');
  }

  return next();
});
