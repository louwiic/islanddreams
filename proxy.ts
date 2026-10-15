import { NextResponse, type NextRequest } from 'next/server';
import { createServerAuth, REFRESH_COOKIE } from '@/lib/pgbase/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminLoginRoute = pathname === '/admin/login';
  const isPartnerRoute = pathname.startsWith('/partenaire') && pathname !== '/partenaire/connexion';
  const isPartnerLoginRoute = pathname === '/partenaire/connexion';
  const isCompteRoute = pathname.startsWith('/compte') && pathname !== '/compte/connexion'
    && !pathname.startsWith('/compte/mot-de-passe-oublie')
    && !pathname.startsWith('/compte/nouveau-mot-de-passe');
  const isLoginRoute = pathname === '/compte/connexion';

  // Passer les routes non protégées directement
  if (!isAdminRoute && !isAdminLoginRoute && !isPartnerRoute && !isPartnerLoginRoute && !isCompteRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const auth = createServerAuth({ get: (name) => request.cookies.get(name), set: () => {} });
  const { data: { user } } = await auth.getUser();
  if (!user && request.cookies.get(REFRESH_COOKIE)?.value && (isAdminRoute || isPartnerRoute || isCompteRoute)) {
    const refresh = new URL('/auth/refresh', request.url);
    refresh.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(refresh);
  }
  const configuredAdminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const adminEmails = new Set([
    ...configuredAdminEmails,
    'admin@islanddreams.re',
    'contact@islanddreams.re',
  ]);
  const isAdmin = Boolean(user?.email && adminEmails.has(user.email.toLowerCase()));

  // Protéger /admin
  if (isAdminRoute && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isAdminRoute && user && !isAdmin) {
    return NextResponse.redirect(new URL('/partenaire', request.url));
  }
  if (isAdminLoginRoute && user) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/partenaire', request.url));
  }

  if (isPartnerRoute && !user) {
    const loginUrl = new URL('/partenaire/connexion', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isPartnerLoginRoute && user) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/partenaire', request.url));
  }

  // Protéger /compte
  if (isCompteRoute && !user) {
    const loginUrl = new URL('/compte/connexion', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger vers /compte si déjà connecté et tente /compte/connexion
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/compte/:path*', '/partenaire/:path*'],
};
