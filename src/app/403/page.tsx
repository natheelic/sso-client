/**
 * 403 Forbidden — Web A
 *
 * Shown when the authenticated user's token does not include this app's SSO_CLIENT_ID
 * in the apps[] claim, meaning the SSO admin has not granted them access.
 */
import { auth, signOut } from "@/lib/auth";

export default async function ForbiddenPage() {
  const session = await auth();
  const user = session?.user as { email?: string | null; name?: string | null } | undefined;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center text-4xl select-none">
        🚫
      </div>

      {/* Message */}
      <div className="max-w-sm space-y-2">
        <div className="text-5xl font-extrabold leading-none text-foreground">403</div>
        <div className="text-xl font-semibold text-foreground">Access Forbidden</div>
        {user?.email ? (
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">{user.email}</span> does not have
            permission to access <strong>Web A</strong>. Contact your administrator.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            You do not have permission to access this application.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap justify-center">
        <a
          href="/"
          className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium no-underline hover:bg-secondary transition-colors"
        >
          Go Home
        </a>

        {user && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium cursor-pointer hover:bg-destructive/20 transition-colors"
            >
              Sign out
            </button>
          </form>
        )}
      </div>

      <a
        href="http://localhost:3000"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors no-underline"
      >
        ← Back to SSO Server
      </a>
    </main>
  );
}
