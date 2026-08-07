"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ForumReply = {
  id: string;
  content: string;
  author: string;
  isAI: boolean;
  createdAt: string;
};

export type Thread = {
  id: string;
  content: string;
  author: string;
  course: string;
  lesson: string;
  replies: ForumReply[];
  upvotes: number;
  resolved: boolean;
  hasAIReply: boolean;
  createdAt: string;
};

export type LessonOption = { id: string; label: string };

export function ForumClient({
  threads,
  lessons,
}: {
  threads: Thread[];
  lessons: LessonOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) =>
      `${t.content} ${t.author} ${t.course} ${t.lesson}`
        .toLowerCase()
        .includes(q)
    );
  }, [threads, query]);

  async function submitThread() {
    if (!lessonId) return toast.error("Selecione uma aula");
    if (content.trim().length < 5) {
      return toast.error("Escreva ao menos 5 caracteres");
    }
    setSaving(true);
    const res = await fetch("/api/aluno/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, content }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return toast.error(error ?? "Erro ao publicar");
    }
    toast.success("Discussão publicada");
    setContent("");
    setCreateOpen(false);
    router.refresh();
  }

  async function submitReply(threadId: string) {
    const text = (replyDraft[threadId] ?? "").trim();
    if (text.length < 2) return toast.error("Escreva a resposta");
    setBusyId(threadId);
    const res = await fetch(`/api/aluno/forum/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setBusyId(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return toast.error(error ?? "Erro ao responder");
    }
    toast.success("Resposta publicada");
    setReplyDraft((d) => ({ ...d, [threadId]: "" }));
    setExpanded(threadId);
    router.refresh();
  }

  async function upvote(threadId: string) {
    setBusyId(threadId);
    const res = await fetch(`/api/aluno/forum/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upvote" }),
    });
    setBusyId(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return toast.error(error ?? "Erro ao curtir");
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar discussões..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          disabled={lessons.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus size={20} />
          Nova Discussão
        </button>
      </div>

      {lessons.length === 0 && (
        <p className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300">
          Você ainda não está vinculado a nenhuma matéria/aula. Peça ao
          administrador para matricular você e liberar o fórum.
        </p>
      )}

      {createOpen && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Escreva sua dúvida ou discussão..."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submitThread}
              disabled={saving || content.trim().length < 5}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhuma discussão ainda. Seja o primeiro a publicar.
          </p>
        ) : (
          visible.map((post) => {
            const isOpen = expanded === post.id;
            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : post.id)}
                  className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 font-medium text-white">
                    {(post.author[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-foreground line-clamp-3">
                        {post.content}
                      </p>
                      {post.resolved && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <CheckCircle size={12} />
                          Resolvido
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span>
                        {post.course} · {post.lesson}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {post.createdAt}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp size={14} />
                        {post.upvotes}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare size={14} />
                        {post.replies.length} respostas
                      </span>
                      {post.hasAIReply && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm text-primary">
                          <Bot size={14} />
                          Resposta IA
                        </span>
                      )}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800">
                    {post.replies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ainda sem respostas. Seja o primeiro a comentar.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {post.replies.map((r) => (
                          <li
                            key={r.id}
                            className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {r.author}
                              </span>
                              {r.isAI && (
                                <span className="inline-flex items-center gap-1 text-primary">
                                  <Bot size={12} /> IA
                                </span>
                              )}
                              <span>{r.createdAt}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                              {r.content}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {!post.resolved && (
                      <>
                        <textarea
                          value={replyDraft[post.id] ?? ""}
                          onChange={(e) =>
                            setReplyDraft((d) => ({
                              ...d,
                              [post.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="Escreva sua resposta..."
                          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => submitReply(post.id)}
                            disabled={busyId === post.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                            )}
                          >
                            <MessageSquare size={14} />
                            Responder
                          </button>
                          <button
                            type="button"
                            onClick={() => upvote(post.id)}
                            disabled={busyId === post.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                          >
                            <ThumbsUp size={14} />
                            Curtir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
