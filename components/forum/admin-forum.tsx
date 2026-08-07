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
  Search,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminReply = {
  id: string;
  content: string;
  author: string;
  isAI: boolean;
  createdAt: string;
};

export type AdminThread = {
  id: string;
  content: string;
  author: string;
  authorEmail: string;
  course: string;
  lesson: string;
  upvotes: number;
  resolved: boolean;
  hasAIReply: boolean;
  createdAt: string;
  replies: AdminReply[];
};

export function AdminForum({ threads }: { threads: AdminThread[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (filter === "open" && t.resolved) return false;
      if (filter === "resolved" && !t.resolved) return false;
      if (!q) return true;
      return `${t.content} ${t.author} ${t.authorEmail} ${t.course} ${t.lesson}`
        .toLowerCase()
        .includes(q);
    });
  }, [threads, query, filter]);

  async function toggleResolved(thread: AdminThread) {
    setBusyId(thread.id);
    const res = await fetch(`/api/admin/forum/${thread.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: !thread.resolved }),
    });
    setBusyId(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return toast.error(error ?? "Erro ao atualizar");
    }
    toast.success(thread.resolved ? "Discussão reaberta" : "Marcada como resolvida");
    router.refresh();
  }

  async function sendReply(threadId: string) {
    const content = (replyDraft[threadId] ?? "").trim();
    if (content.length < 2) return toast.error("Escreva a resposta");
    setBusyId(threadId);
    const res = await fetch(`/api/admin/forum/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por aluno, turma, aula ou texto..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {(
            [
              ["all", "Todas"],
              ["open", "Abertas"],
              ["resolved", "Resolvidas"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === id
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhuma discussão encontrada.
          </p>
        ) : (
          visible.map((thread) => {
            const isOpen = expanded === thread.id;
            return (
              <div
                key={thread.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : thread.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                    {(thread.author[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm text-foreground line-clamp-2">
                        {thread.content}
                      </p>
                      {thread.resolved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <CheckCircle size={12} /> Resolvida
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                          Aberta
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {thread.author}
                      </span>
                      <span>{thread.authorEmail}</span>
                      <span>
                        {thread.course} · {thread.lesson}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {thread.createdAt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp size={12} /> {thread.upvotes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={12} /> {thread.replies.length}{" "}
                        respostas
                      </span>
                      {thread.hasAIReply && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Bot size={12} /> IA
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
                    {thread.replies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ainda sem respostas.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {thread.replies.map((r) => (
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

                    <textarea
                      value={replyDraft[thread.id] ?? ""}
                      onChange={(e) =>
                        setReplyDraft((d) => ({
                          ...d,
                          [thread.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Responder como administrador..."
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => sendReply(thread.id)}
                        disabled={busyId === thread.id}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Responder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleResolved(thread)}
                        disabled={busyId === thread.id}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {thread.resolved
                          ? "Reabrir discussão"
                          : "Marcar como resolvida"}
                      </Button>
                    </div>
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
