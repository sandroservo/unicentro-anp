import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { ActivityTake } from "@/components/activities/activity-take";

export default async function ResolverAtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  return (
    <>
      <Header title="Atividade" subtitle="Resolução" />
      <div className="space-y-6">
        <ActivityTake activityId={id} />
      </div>
    </>
  );
}
