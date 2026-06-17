/**
 * Participant home — the survey/certificate platform's main authenticated
 * surface (replaces the old SSO user-info dashboard). Gated by the real
 * NextAuth SSO session; proxy.ts also enforces app permission.
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActivityList } from "@/components/survey/participant/activity-list";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const u = session.user;
  return <ActivityList user={{ name: u.name ?? "", email: u.email ?? null, image: u.image ?? null }} />;
}
