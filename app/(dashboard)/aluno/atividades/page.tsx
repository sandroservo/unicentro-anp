import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { canPreviewStudentView } from "@/lib/enrollment-access";
import { cn } from "@/lib/utils";

function formatDeadline(dueDate: Date | null) {
  if (!dueDate) return "Sem prazo";
  const diff = dueDate.getTime() - Date.now();
  if (diff < 0) return "Prazo encerrado";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 1) return "Até amanhã";
  return `${days} dias`;
}

function typeIcon(type: string) {
  const t = type.toUpperCase();
  if (t === "ESSAY") return FileText;
  if (t === "FORUM") return MessageSquare;
  return ClipboardList;
}

export default async function AtividadesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isPreview = canPreviewStudentView(session.user.role);

  const activities = await prisma.activity.findMany({
    where: isPreview
      ? undefined
      : {
          lesson: {
            module: {
              OR: [
                {
                  subjectId: null,
                  course: { enrollments: { some: { userId } } },
                },
                {
                  subject: { enrollments: { some: { userId } } },
                },
              ],
            },
          },
        },
    select: {
      id: true,
      title: true,
      type: true,
      points: true,
      dueDate: true,
      lesson: {
        select: {
          title: true,
          module: {
            select: {
              course: { select: { title: true } },
              subject: { select: { title: true } },
            },
          },
        },
      },
      submissions: {
        where: { userId },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { finalGrade: true, aiGrade: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { id: "desc" }],
  });

  const rows = activities.map((a) => {
    const sub = a.submissions[0];
    return {
      id: a.id,
      title: a.title,
      type: a.type,
      points: a.points,
      course: a.lesson.module.course.title,
      lesson: a.lesson.title,
      subject: a.lesson.module.subject?.title,
      status: sub ? ("completed" as const) : ("pending" as const),
      grade: sub?.finalGrade ?? sub?.aiGrade ?? null,
      deadline: formatDeadline(a.dueDate),
    };
  });

  const pending = rows.filter((a) => a.status === "pending").length;
  const completed = rows.filter((a) => a.status === "completed").length;

  return (
    <>
      <Header
        title="Atividades"
        subtitle={
          isPreview
            ? "Pré-visualização: atividades cadastradas na plataforma"
            : "Gerencie suas atividades e entregas"
        }
      />
      <div className="space-y-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Pendentes
                </p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {pending}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Concluídas</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {completed}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <h2 className="font-semibold text-foreground">Todas as Atividades</h2>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <AlertCircle size={28} className="text-gray-400" />
              <p>Nenhuma atividade disponível no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((activity) => {
                const Icon = typeIcon(activity.type);
                return (
                  <Link
                    key={activity.id}
                    href={`/aluno/atividades/${activity.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        activity.type.toUpperCase() === "ESSAY"
                          ? "bg-primary/10 text-primary"
                          : activity.type.toUpperCase() === "FORUM"
                            ? "bg-green-100 text-primary dark:bg-green-500/15"
                            : "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">
                        {activity.title}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {activity.course}
                        {activity.subject ? ` · ${activity.subject}` : ""}
                        {` · ${activity.lesson}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {activity.status === "completed" ? (
                        <span className="font-medium text-primary">
                          {activity.grade != null
                            ? `Nota: ${activity.grade}`
                            : "Enviada"}
                        </span>
                      ) : (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                          Prazo: {activity.deadline}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {activity.points} pts
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="shrink-0 text-muted-foreground"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
