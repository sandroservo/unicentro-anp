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
    <>
      <Header title="Disciplinas" subtitle={course.title} />
      <div className="space-y-6">
        <SubjectsTable courseId={cursoId} canWrite={canWrite} />
      </div>
    </>
  );
}
