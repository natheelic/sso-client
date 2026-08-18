/**
 * proxy.ts — Next.js 16 route guard.
 *
 * Access model:
 *  - Every survey issues a certificate tied to a verified identity, so taking
 *    one requires SSO login — but any authenticated user is enough, no app
 *    permission needed.
 *  - The survey-creator console at /admin additionally requires the user to
 *    be authorized for this app (its SSO_CLIENT_ID must appear in the
 *    token's apps[] claim).
 *
 * This is the default-deny backstop: every route not explicitly public below
 * requires a session, matching (and backing up) the per-page auth checks in
 * src/app/**\/page.tsx and the app-authorization check in src/app/admin/layout.tsx.
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_SLUG = process.env.SSO_CLIENT_ID!;

const PUBLIC_PREFIXES = ["/login", "/403"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const session = req.auth as { user?: { apps?: string[] } } | null;

  // Not signed in → SSO login, then return to the requested page.
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // /admin additionally requires authorization for this app → else 403.
  if (pathname.startsWith("/admin")) {
    const apps = session.user?.apps ?? [];
    if (!apps.includes(APP_SLUG)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
