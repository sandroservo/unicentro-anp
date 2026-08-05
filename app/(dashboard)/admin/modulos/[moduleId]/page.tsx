import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { LessonsTable } from "@/components/lessons/lessons-table";

export default async function AulasPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { moduleId } = await params;
  const canWrite = session.user.permissions.includes("lessons.write");

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, subject: { select: { title: true } } },
  });
  if (!mod) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title={`Aulas · ${mod.title}`} subtitle={mod.subject?.title ?? undefined} />
      <div className="flex-1 p-6 overflow-auto">
        <LessonsTable moduleId={moduleId} canWrite={canWrite} />
      </div>
    </div>
  );
}
