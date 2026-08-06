import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Layers, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { canPreviewStudentView } from "@/lib/enrollment-access";

export default async function MinhasTurmasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isPreview = canPreviewStudentView(session.user.role);

  const subjectSelect = {
    id: true,
    title: true,
    modules: {
      select: { _count: { select: { lessons: true } } },
    },
  } as const;

  type CourseCard = {
    id: string;
    title: string;
    description: string | null;
    code: string | null;
    isActive: boolean;
    subjects: Array<{
      id: string;
      title: string;
      modules: Array<{ _count: { lessons: number } }>;
    }>;
    progress: number;
  };

  let courses: CourseCard[];

  if (isPreview) {
    const rows = await prisma.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        isActive: true,
        subjects: {
          select: subjectSelect,
          orderBy: { order: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });
    courses = rows.map((c) => ({ ...c, progress: 0 }));
  } else {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            code: true,
            isActive: true,
            subjects: {
              where: {
                enrollments: { some: { userId: session.user.id } },
              },
              select: subjectSelect,
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
    courses = enrollments.map(({ course, progress }) => ({
      ...course,
      progress,
    }));
  }

  return (
    <>
      <Header
        title="Minhas Turmas"
        subtitle={
          isPreview
            ? "Pré-visualização: todas as turmas ativas como o aluno vê"
            : "Turmas e matérias em que você está vinculado"
        }
      />
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            {isPreview
              ? "Nenhuma turma ativa cadastrada ainda."
              : "Você ainda não está matriculado em nenhuma turma."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const lessons = course.subjects.reduce(
                (acc, s) =>
                  acc + s.modules.reduce((a, m) => a + m._count.lessons, 0),
                0
              );
              return (
                <Link
                  key={course.id}
                  href={`/aluno/cursos/${course.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
                    <BookOpen className="text-white/30" size={56} />
                    {course.code && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {course.code}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-brand-600 dark:text-white/90">
                      {course.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {course.description || "Sem descrição"}
                    </p>
                    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
                      <span className="inline-flex items-center gap-1">
                        <Layers size={14} /> {course.subjects.length} matérias
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle size={14} /> {lessons} aulas
                      </span>
                      {!isPreview && (
                        <span>{Math.round(course.progress)}% progresso</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
