import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import {
  assertCourseEnrollment,
  canPreviewStudentView,
} from "@/lib/enrollment-access";
import { ApiError } from "@/lib/api";

type Props = { params: Promise<{ cursoId: string }> };

export default async function TurmaAlunoPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { cursoId } = await params;
  const isPreview = canPreviewStudentView(session.user.role);

  try {
    await assertCourseEnrollment(session.user.id, cursoId, session.user.role);
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) redirect("/aluno/cursos");
    throw e;
  }

  const course = await prisma.course.findUnique({
    where: { id: cursoId },
    select: {
      id: true,
      title: true,
      description: true,
      subjects: {
        ...(isPreview
          ? {}
          : {
              where: { enrollments: { some: { userId: session.user.id } } },
            }),
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          code: true,
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  videoId: true,
                  videoUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  return (
    <>
      <Header
        title={course.title}
        subtitle={
          isPreview
            ? "Pré-visualização: todas as matérias e aulas desta turma"
            : "Matérias e aulas liberadas para você"
        }
      />
      <div className="space-y-6">
        {course.subjects.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            {isPreview
              ? "Nenhuma matéria cadastrada nesta turma ainda."
              : "Você ainda não está vinculado a nenhuma matéria desta turma. Peça ao administrador para vincular você às matérias."}
          </div>
        ) : (
          course.subjects.map((subject) => (
            <section
              key={subject.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                  {subject.title}
                  {subject.code ? (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({subject.code})
                    </span>
                  ) : null}
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {subject.modules.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">Sem módulos nesta matéria.</p>
                ) : (
                  subject.modules.map((mod) => (
                    <div key={mod.id} className="p-4">
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {mod.title}
                      </p>
                      <ul className="space-y-1">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <Link
                              href={`/aluno/cursos/${cursoId}/aulas/${lesson.id}`}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <PlayCircle
                                size={18}
                                className={
                                  lesson.videoId || lesson.videoUrl
                                    ? "text-brand-500"
                                    : "text-gray-400"
                                }
                              />
                              <span className="flex-1 text-gray-800 dark:text-white/90">
                                {lesson.title}
                              </span>
                              {lesson.duration ? (
                                <span className="text-xs text-gray-400">
                                  {Math.round(lesson.duration / 60)} min
                                </span>
                              ) : null}
                              <ChevronRight size={16} className="text-gray-400" />
                            </Link>
                          </li>
                        ))}
                        {mod.lessons.length === 0 && (
                          <li className="px-3 py-2 text-xs text-gray-400">
                            Nenhuma aula cadastrada.
                          </li>
                        )}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
