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
    <div className="flex flex-col h-full">
      <Header title="Atividade" subtitle="Resolução" />
      <div className="flex-1 p-6 overflow-auto">
        <ActivityTake activityId={id} />
      </div>
    </div>
  );
}
