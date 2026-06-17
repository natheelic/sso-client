import { ActivityEditorScreen } from "@/components/survey/admin/activity-editor";

export default async function AdminActivityEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <ActivityEditorScreen id={id} initialTab={tab} />;
}
