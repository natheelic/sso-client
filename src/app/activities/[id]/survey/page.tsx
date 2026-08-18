import { auth, loginRedirectUrl } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getActivity } from "@/lib/activities-db";
import { getMyCertificate } from "@/lib/submissions-db";
import { getCollegeSettings } from "@/lib/college-db";
import { SurveyFlow } from "@/components/survey/participant/survey-flow";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cert?: string }>;
}) {
  const { id } = await params;
  const [{ cert }, session, activity, college] = await Promise.all([searchParams, auth(), getActivity(id), getCollegeSettings()]);

  if (!session?.user) redirect(loginRedirectUrl(`/activities/${id}/survey${cert ? `?cert=${cert}` : ""}`));

  if (!activity) notFound();

  const u = session.user;
  const initialRecord = cert === "1" ? await getMyCertificate(id) : null;

  return (
    <SurveyFlow
      activity={activity}
      user={{ name: u.name ?? "", email: u.email ?? null, image: u.image ?? null }}
      startAtCert={cert === "1"}
      initialRecord={initialRecord}
      college={college}
    />
  );
}
