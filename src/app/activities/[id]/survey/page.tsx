import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ACTIVITIES } from "@/lib/survey-data";
import { SurveyFlow } from "@/components/survey/participant/survey-flow";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cert?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { cert } = await searchParams;
  const activity = ACTIVITIES.find((a) => a.id === id);
  if (!activity) notFound();

  const u = session.user;
  return (
    <SurveyFlow
      activity={activity}
      user={{ name: u.name ?? "", email: u.email ?? null, image: u.image ?? null }}
      startAtCert={cert === "1"}
    />
  );
}
