import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { GradebookTable } from "@/components/gradebook/gradebook-table";

export default async function NotasPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { cursoId } = await params;
  const canWrite = session.user.permissions.includes("courses.write");

  const course = await prisma.course.findUnique({
    where: { id: cursoId },
    select: { title: true },
  });
  if (!course) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title={`Notas · ${course.title}`} subtitle="Boletim" />
      <div className="flex-1 p-6 overflow-auto">
        <GradebookTable courseId={cursoId} canWrite={canWrite} />
      </div>
    </div>
  );
}
