"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Bot,
  Clock,
  Plus,
  Search,
} from "lucide-react";

export type Thread = {
  id: string;
  content: string;
  author: string;
  course: string;
  lesson: string;
  replies: number;
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
  const [open, setOpen] = useState(false);
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = q
    ? threads.filter((t) =>
        `${t.content} ${t.author} ${t.course} ${t.lesson}`
          .toLowerCase()
          .includes(q)
      )
    : threads;

  async function submit() {
    if (!lessonId) return toast.error("Selecione uma aula");
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
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar discussões..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={lessons.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
        >
          <Plus size={20} />
          Nova Discussão
        </button>
      </div>

      {/* Create form */}
      {open && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving || content.trim().length < 5}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhuma discussão encontrada.
          </p>
        ) : (
          visible.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                  {post.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-foreground line-clamp-2">
                      {post.content}
                    </p>
                    {post.resolved && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium whitespace-nowrap">
                        <CheckCircle size={12} />
                        Resolvido
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>
                      {post.course} · {post.lesson}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp size={14} />
                      {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare size={14} />
                      {post.replies} respostas
                    </span>
                    {post.hasAIReply && (
                      <span className="flex items-center gap-1 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Bot size={14} />
                        Resposta IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
