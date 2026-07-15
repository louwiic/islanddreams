import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
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
