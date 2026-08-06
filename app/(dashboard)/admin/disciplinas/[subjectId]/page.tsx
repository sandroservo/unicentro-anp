import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ModulesTable } from "@/components/modules/modules-table";
import { SubjectEnrollments } from "@/components/enrollments/subject-enrollments";
import { SubjectActivitiesTable } from "@/components/activities/subject-activities-table";

export default async function DisciplinaPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { subjectId } = await params;
  const canWriteLessons = session.user.permissions.includes("lessons.write");
  const canWriteStudents = session.user.permissions.includes("students.write");

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, title: true, courseId: true, course: { select: { title: true } } },
  });
  if (!subject) notFound();

  return (
    <>
      <Header
        title={`Matéria · ${subject.title}`}
        subtitle={`Turma: ${subject.course.title}`}
        backHref={`/admin/cursos/${subject.courseId}/disciplinas`}
        backLabel="Voltar"
      />
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Alunos vinculados
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Defina quais alunos da turma podem assistir às aulas e ver as notas desta matéria.
          </p>
          <SubjectEnrollments
            subjectId={subjectId}
            courseId={subject.courseId}
            canWrite={canWriteStudents}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Módulos e aulas
          </h3>
          <ModulesTable subjectId={subjectId} canWrite={canWriteLessons} />
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Atividades
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cadastre atividades e vincule a uma aula desta matéria. Só alunos
            vinculados à matéria verão e poderão responder.
          </p>
          <SubjectActivitiesTable
            subjectId={subjectId}
            canWrite={canWriteLessons}
          />
        </section>
      </div>
    </>
  );
}
