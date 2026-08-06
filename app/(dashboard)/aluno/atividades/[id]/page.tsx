import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { ActivityTake } from "@/components/activities/activity-take";
import { Button } from "@/components/ui/button";

export default async function ResolverAtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  return (
    <>
      <Header
        title="Atividade"
        subtitle="Resolução"
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/aluno/atividades">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            }
          />
        }
      />
      <div className="space-y-6">
        <ActivityTake activityId={id} />
      </div>
    </>
  );
}
