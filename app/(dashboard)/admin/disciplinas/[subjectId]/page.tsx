import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ModulesTable } from "@/components/modules/modules-table";

export default async function ModulosPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { subjectId } = await params;
  const canWrite = session.user.permissions.includes("lessons.write");

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { title: true, course: { select: { title: true } } },
  });
  if (!subject) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title={`Módulos · ${subject.title}`} subtitle={subject.course.title} />
      <div className="flex-1 p-6 overflow-auto">
        <ModulesTable subjectId={subjectId} canWrite={canWrite} />
      </div>
    </div>
  );
}
