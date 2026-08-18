/**
 * Participant home. Browsing activities is public (discoverable/shareable);
 * login is only required once someone starts a survey, since taking one
 * issues a certificate tied to a verified identity.
 */
import { auth } from "@/lib/auth";
import { ActivityList } from "@/components/survey/participant/activity-list";

export default async function HomePage() {
  const session = await auth();
  const u = session?.user;
  const user = u ? { name: u.name ?? "", email: u.email ?? null, image: u.image ?? null } : null;

  return <ActivityList user={user} />;
}
