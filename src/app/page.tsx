/**
 * Participant home. Every survey here issues a certificate, so taking one
 * requires SSO login (any authenticated user — no app-permission needed; that's
 * only for the /admin creator console). We gate at the page level and pass the
 * verified identity down for the certificate.
 */
import { requireSession } from "@/lib/auth";
import { ActivityList } from "@/components/survey/participant/activity-list";

export default async function HomePage() {
  const session = await requireSession("/");

  const u = session.user;
  return <ActivityList user={{ name: u.name ?? "", email: u.email ?? null, image: u.image ?? null }} />;
}
