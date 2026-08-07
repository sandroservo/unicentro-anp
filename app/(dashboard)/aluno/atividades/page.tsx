import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  Award,
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
import { Badge } from "@/components/ui/badge";
import { canPreviewStudentView } from "@/lib/enrollment-access";
import { cn } from "@/lib/utils";

type Deadline = { text: string; tone: "over" | "soon" | "ok" | "none" };

function formatDeadline(dueDate: Date | null): Deadline {
  if (!dueDate) return { text: "Sem prazo", tone: "none" };
  const diff = dueDate.getTime() - Date.now();
  if (diff < 0) return { text: "Prazo encerrado", tone: "over" };
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 1) return { text: "Até amanhã", tone: "soon" };
  if (days <= 3) return { text: `${days} dias`, tone: "soon" };
  return { text: `${days} dias`, tone: "ok" };
}

function typeMeta(type: string) {
  const t = type.toUpperCase();
  if (t === "ESSAY")
    return { icon: FileText, label: "Redação", chip: "bg-primary/10 text-primary" };
  if (t === "FORUM")
    return {
      icon: MessageSquare,
      label: "Fórum",
      chip: "bg-green-100 text-primary dark:bg-green-500/15",
    };
  return {
    icon: ClipboardList,
    label: "Quiz",
    chip: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  };
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
  const graded = rows.filter((a) => a.grade != null);
  const avgGrade = graded.length
    ? (graded.reduce((s, a) => s + (a.grade ?? 0), 0) / graded.length).toFixed(1)
    : "—";

  const stats = [
    {
      label: "Pendentes",
      value: pending,
      icon: Clock,
      chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Concluídas",
      value: completed,
      icon: CheckCircle,
      chip: "bg-primary/10 text-primary",
    },
    {
      label: "Nota média",
      value: avgGrade,
      icon: Award,
      chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  ];

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      s.chip
                    )}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
                const meta = typeMeta(activity.type);
                const Icon = meta.icon;
                return (
                  <Link
                    key={activity.id}
                    href={`/aluno/atividades/${activity.id}`}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        meta.chip
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-medium text-foreground">
                          {activity.title}
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {activity.course}
                        {activity.subject ? ` · ${activity.subject}` : ""}
                        {` · ${activity.lesson}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {activity.status === "completed" ? (
                        activity.grade != null ? (
                          <Badge variant="default">Nota {activity.grade}</Badge>
                        ) : (
                          <Badge variant="secondary">Enviada</Badge>
                        )
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            activity.deadline.tone === "over"
                              ? "text-destructive"
                              : activity.deadline.tone === "soon"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                          )}
                        >
                          {activity.deadline.text}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {activity.points} pts
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
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
