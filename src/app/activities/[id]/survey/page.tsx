import { auth, loginRedirectUrl } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getActivity } from "@/lib/activities-db";
import { SurveyFlow } from "@/components/survey/participant/survey-flow";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cert?: string }>;
}) {
  const { id } = await params;
  const [{ cert }, session, activity] = await Promise.all([searchParams, auth(), getActivity(id)]);

  if (!session?.user) redirect(loginRedirectUrl(`/activities/${id}/survey${cert ? `?cert=${cert}` : ""}`));

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
