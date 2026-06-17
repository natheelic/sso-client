import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ACTIVITIES } from "@/lib/survey-data";
import { ActivityIntro } from "@/components/survey/participant/activity-intro";

export default async function ActivityIntroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qr?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { qr } = await searchParams;
  const activity = ACTIVITIES.find((a) => a.id === id);
  if (!activity) notFound();

  const u = session.user;
  return (
    <ActivityIntro
      activity={activity}
      user={{ name: u.name ?? "", email: u.email ?? null, image: u.image ?? null }}
      fromQR={qr === "1"}
    />
  );
}
