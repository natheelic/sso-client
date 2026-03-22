/**
 * Dashboard — Web A
 *
 * Server component: reads session from the local NextAuth cookie
 * (populated via the SSO OAuth2 flow) and displays user info + RBAC claims.
 */
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

const APP_NAME = "Web A";
const APP_SLUG = "web-a";

// Map all known app slugs to friendly display names
const APP_LABELS: Record<string, string> = {
  "web-a": "Web A",
  "web-b": "Web B",
  "web-c": "Web C",
};

export default async function DashboardPage() {
  const session = await auth();

  // Middleware (proxy.ts) should already guard this, but be defensive
  if (!session?.user) redirect("/login");

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    apps: string[];
  };

  const hasAccess = user.apps.includes(APP_SLUG);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-6">

      {/* ── App badge ──────────────────────────────────────────────── */}
      <div className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wide">
        {APP_NAME}
      </div>

      {/* ── User card ──────────────────────────────────────────────── */}
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 flex flex-col gap-5 shadow-lg">

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt="avatar"
              width={52}
              height={52}
              className="rounded-full ring-2 ring-border"
            />
          ) : (
            <div className="w-13 h-13 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-secondary-foreground shrink-0"
              style={{ width: 52, height: 52 }}>
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-base truncate">{user.name ?? "(no name)"}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Role</span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-medium">
            {user.role}
          </span>
        </div>

        {/* Access status for this app */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Access to {APP_NAME}</span>
          {hasAccess ? (
            <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-medium">
              ✓ Permitted
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
              ✗ Denied
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Permitted apps */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Permitted Applications</div>
          {user.apps.length === 0 ? (
            <div className="text-sm text-muted-foreground">No apps assigned</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.apps.map((slug) => (
                <span
                  key={slug}
                  className="px-2.5 py-1 rounded-md bg-secondary border border-border text-xs text-secondary-foreground font-medium"
                >
                  {APP_LABELS[slug] ?? slug}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* User ID */}
        <div className="text-xs text-muted-foreground/60 break-all">
          ID: {user.id}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sign out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer border-0"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* ── SSO server link ────────────────────────────────────────── */}
      <a
        href="http://localhost:3000"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors no-underline"
      >
        ← Back to SSO Server
      </a>
    </main>
  );
}
