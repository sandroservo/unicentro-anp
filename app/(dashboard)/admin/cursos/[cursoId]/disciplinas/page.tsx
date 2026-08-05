import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { SubjectsTable } from "@/components/subjects/subjects-table";

export default async function DisciplinasPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { cursoId } = await params;
  const canWrite = session.user.permissions.includes("subjects.write");

  const course = await prisma.course.findUnique({
    where: { id: cursoId },
    select: { title: true },
  });
  if (!course) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title="Disciplinas" subtitle={course.title} />
      <div className="flex-1 p-6 overflow-auto">
        <SubjectsTable courseId={cursoId} canWrite={canWrite} />
      </div>
    </div>
  );
}
