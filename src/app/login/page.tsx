/**
 * Login page — Web A
 *
 * Clicking "Continue with SSO" triggers the OAuth2 Authorization Code flow:
 *   1. NextAuth redirects to SSO server /api/oauth/authorize
 *   2. User authenticates (or is already logged in) on the SSO server
 *   3. SSO checks UserAppPermission for web-a
 *   4. SSO issues a code and redirects back to /api/auth/callback/sso
 *   5. NextAuth exchanges code for token, creates local session
 */
import { signIn } from "@/lib/auth";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-6 shadow-lg">

        {/* App badge */}
        <div className="px-5 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold tracking-wide">
          Web A
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            You will be redirected to the central SSO server to authenticate.
          </p>
        </div>

        {/* SSO sign-in button */}
        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("sso", { redirectTo: callbackUrl ?? "/" });
          }}
        >
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer border-0"
          >
            Continue with SSO →
          </button>
        </form>

        <p className="text-xs text-muted-foreground">
          Powered by the central SSO server
        </p>
      </div>
    </main>
  );
}
