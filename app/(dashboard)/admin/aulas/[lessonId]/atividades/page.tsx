import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ActivitiesTable } from "@/components/activities/activities-table";

export default async function AtividadesPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { lessonId } = await params;
  const canWrite = session.user.permissions.includes("lessons.write");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true },
  });
  if (!lesson) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title={`Atividades · ${lesson.title}`} subtitle="Autoria" />
      <div className="flex-1 p-6 overflow-auto">
        <ActivitiesTable lessonId={lessonId} canWrite={canWrite} />
      </div>
    </div>
  );
}
