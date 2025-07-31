import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const locales = ['ar', 'de', 'en', 'it'];
const defaultLocale = 'en';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/', // Home page
  '/payment-success',
  '/payment-failed',
  '/offer/accepted',
  '/offer/rejected',
  '/success',
  "/failure",
  "/privacy",
  "/terms"
];

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return pathname.split('/')[1];
  }

  // Check cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // Check accept-language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .map(lang => lang.split('-')[0]); // Extract base language
    
    for (const lang of languages) {
      if (locales.includes(lang)) {
        return lang;
      }
    }
  }

  return defaultLocale;
}

// Check if a route is public (doesn't require authentication)
function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix to check the actual route
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathWithoutLocale === '/';
    }
    return pathWithoutLocale.startsWith(route);
  });
}



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the project is active

  
  
  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get the locale (either from URL or determine it)
  const locale = pathnameHasLocale ? pathname.split('/')[1] : getLocale(request);

  // If no locale in pathname, redirect with locale
  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Check authentication for protected routes
  if (!isPublicRoute(pathname)) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      // Redirect to login page with the current locale
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      
      // Optional: Add a redirect parameter to return to the original page after login
      url.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request if authenticated or on public route
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api routes, static files)
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
}; 