import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { CourseEnrollments } from "@/components/enrollments/course-enrollments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ cursoId: string }> };

export default async function TurmaAlunosPage({ params }: Props) {
  const session = await requirePermission("students.read");
  const canWrite = session.user.permissions.includes("students.write");
  const { cursoId } = await params;

  const course = await prisma.course.findUnique({ where: { id: cursoId } });
  if (!course) notFound();

  return (
    <>
      <Header
        title={`Alunos da turma: ${course.title}`}
        subtitle="Matricule alunos nesta turma (ANP)"
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href="/admin/cursos">
              <ArrowLeft className="h-4 w-4" /> Voltar às turmas
            </Link>
          } />
        }
      />
      <div className="space-y-6">
        <CourseEnrollments courseId={cursoId} canWrite={canWrite} />
      </div>
    </>
  );
}
