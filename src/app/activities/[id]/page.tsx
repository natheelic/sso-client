import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ACTIVITIES } from "@/lib/survey-data";
import { ActivityIntro } from "@/components/survey/participant/activity-intro";

/** Browsing an activity is public; login is only required to start its survey. */
export default async function ActivityIntroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qr?: string }>;
}) {
  const [{ id }, { qr }, session] = await Promise.all([params, searchParams, auth()]);

  const activity = ACTIVITIES.find((a) => a.id === id);
  if (!activity) notFound();

  const u = session?.user;
  const user = u ? { name: u.name ?? "", email: u.email ?? null, image: u.image ?? null } : null;

  return <ActivityIntro activity={activity} user={user} fromQR={qr === "1"} />;
}
