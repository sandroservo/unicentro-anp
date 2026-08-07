import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { canPreviewStudentView } from "@/lib/enrollment-access";
import { ForumClient, type Thread } from "./forum-client";

function enrolledLessonWhere(userId: string) {
  return {
    module: {
      OR: [
        { subjectId: null, course: { enrollments: { some: { userId } } } },
        { subject: { enrollments: { some: { userId } } } },
      ],
    },
  };
}

function relativeTime(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export default async function ForumPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isPreview = canPreviewStudentView(session.user.role);
  const lessonScope = isPreview ? {} : enrolledLessonWhere(userId);

  const [posts, lessons] = await Promise.all([
    prisma.forumPost.findMany({
      where: { parentId: null, lesson: lessonScope },
      select: {
        id: true,
        content: true,
        upvotes: true,
        isResolved: true,
        isAI: true,
        createdAt: true,
        user: { select: { name: true } },
        lesson: {
          select: {
            title: true,
            module: { select: { course: { select: { title: true } } } },
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            isAI: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.lesson.findMany({
      where: lessonScope,
      select: {
        id: true,
        title: true,
        module: { select: { course: { select: { title: true } } } },
      },
      orderBy: [{ module: { course: { title: "asc" } } }, { title: "asc" }],
      take: 200,
    }),
  ]);

  const threads: Thread[] = posts.map((p) => ({
    id: p.id,
    content: p.content,
    author: p.user.name || "Aluno",
    course: p.lesson.module.course.title,
    lesson: p.lesson.title,
    replies: p.replies.map((r) => ({
      id: r.id,
      content: r.content,
      author: r.user.name || "Usuário",
      isAI: r.isAI,
      createdAt: relativeTime(r.createdAt),
    })),
    upvotes: p.upvotes,
    resolved: p.isResolved,
    hasAIReply: p.isAI || p.replies.some((r) => r.isAI),
    createdAt: relativeTime(p.createdAt),
  }));

  const lessonOptions = lessons.map((l) => ({
    id: l.id,
    label: `${l.module.course.title} · ${l.title}`,
  }));

  const resolved = threads.filter((t) => t.resolved).length;
  const withAI = threads.filter((t) => t.hasAIReply).length;
  const totalReplies = threads.reduce((acc, t) => acc + t.replies.length, 0);
  const stats = [
    { value: threads.length, label: "Discussões", tone: "text-foreground" },
    { value: resolved, label: "Resolvidas", tone: "text-primary" },
    { value: withAI, label: "Com resposta IA", tone: "text-primary" },
    { value: totalReplies, label: "Respostas", tone: "text-purple-600" },
  ];

  return (
    <>
      <Header
        title="Fórum"
        subtitle={
          isPreview
            ? "Pré-visualização: discussões da plataforma"
            : "Discussões e dúvidas das suas turmas"
        }
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className={`text-2xl font-bold ${s.tone}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <ForumClient threads={threads} lessons={lessonOptions} />
      </div>
    </>
  );
}
