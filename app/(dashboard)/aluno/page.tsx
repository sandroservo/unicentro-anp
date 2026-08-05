import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, CheckCircle2, Award, ClipboardList, ChevronRight, Bot } from "lucide-react";

async function getStudentData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          aiPersona: true,
          modules: { select: { lessons: { select: { id: true } } } },
        },
      },
    },
  });
  const [progress, certificates, submissions] = await Promise.all([
    prisma.progress.findMany({ where: { userId }, select: { completed: true } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.submission.count({ where: { userId } }),
  ]);
  return { enrollments, progress, certificates, submissions };
}

export default async function AlunoDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  let enrollments: Awaited<ReturnType<typeof getStudentData>>["enrollments"] = [];
  let completedLessons = 0;
  let totalLessons = 0;
  let certificates = 0;
  let submissions = 0;

  if (userId) {
    const data = await getStudentData(userId);
    enrollments = data.enrollments;
    certificates = data.certificates;
    submissions = data.submissions;
    completedLessons = data.progress.filter((p) => p.completed).length;
    totalLessons = enrollments.reduce(
      (acc, e) => acc + e.course.modules.reduce((a, m) => a + m.lessons.length, 0),
      0
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Cursos matriculados" value={enrollments.length} icon={BookOpen} />
          <StatCard
            label="Aulas concluídas"
            value={`${completedLessons}/${totalLessons}`}
            icon={CheckCircle2}
          />
          <StatCard label="Atividades enviadas" value={submissions} icon={ClipboardList} />
          <StatCard label="Certificados" value={certificates} icon={Award} />
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Meus Cursos</h2>
            <Link href="/aluno/cursos" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Você ainda não está matriculado em cursos.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {enrollments.map((e) => {
                const lessons = e.course.modules.reduce((a, m) => a + m.lessons.length, 0);
                return (
                  <Link
                    key={e.id}
                    href={`/aluno/cursos/${e.course.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{e.course.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Bot size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {e.course.aiPersona || "Professor Virtual"} · {lessons} aulas
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round(e.progress)}%
                    </span>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
