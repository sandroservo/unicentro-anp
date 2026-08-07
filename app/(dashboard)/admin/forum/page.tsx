import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import {
  AdminForum,
  type AdminThread,
} from "@/components/forum/admin-forum";

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

export default async function AdminForumPage() {
  await requirePermission("courses.read");

  const posts = await prisma.forumPost.findMany({
    where: { parentId: null },
    select: {
      id: true,
      content: true,
      upvotes: true,
      isResolved: true,
      isAI: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
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
    take: 200,
  });

  const threads: AdminThread[] = posts.map((p) => ({
    id: p.id,
    content: p.content,
    author: p.user.name || "Aluno",
    authorEmail: p.user.email,
    course: p.lesson.module.course.title,
    lesson: p.lesson.title,
    upvotes: p.upvotes,
    resolved: p.isResolved,
    hasAIReply: p.isAI || p.replies.some((r) => r.isAI),
    createdAt: relativeTime(p.createdAt),
    replies: p.replies.map((r) => ({
      id: r.id,
      content: r.content,
      author: r.user.name || "Usuário",
      isAI: r.isAI,
      createdAt: relativeTime(r.createdAt),
    })),
  }));

  const open = threads.filter((t) => !t.resolved).length;
  const resolved = threads.filter((t) => t.resolved).length;
  const withAI = threads.filter((t) => t.hasAIReply).length;
  const totalReplies = threads.reduce((acc, t) => acc + t.replies.length, 0);

  const stats = [
    { value: threads.length, label: "Discussões" },
    { value: open, label: "Abertas" },
    { value: resolved, label: "Resolvidas" },
    { value: withAI, label: "Com IA" },
    { value: totalReplies, label: "Respostas" },
  ];

  return (
    <>
      <Header
        title="Fórum"
        subtitle="Acompanhe e responda as discussões dos alunos"
        backHref="/admin"
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <AdminForum threads={threads} />
      </div>
    </>
  );
}
