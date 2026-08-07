"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Brain,
  FileText,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Source = { content: string; score: number };

type TutorChatProps = {
  courseId?: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
  subjectTitle?: string;
  compact?: boolean;
};

const SUGGESTIONS = [
  "Explique o conceito principal desta turma",
  "Resuma os pontos mais importantes",
  "Me dê um exemplo prático",
  "Crie um exercício rápido de fixação",
];

export function TutorChat({
  courseId,
  courseTitle,
  lessonTitle,
  lessonContent,
  subjectTitle,
  compact = false,
}: TutorChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setSources([]);
    setInput("");
  }, [courseId, lessonTitle]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const history = messages.slice(-6);
    setMessages((m) => [
      ...m,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setPending(true);
    setSources([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/aluno/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          courseId: courseId || undefined,
          lessonTitle,
          lessonContent,
          subjectTitle,
          history,
          stream: true,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erro ao falar com o Professor IA");
      }

      const ctype = res.headers.get("content-type") || "";
      if (!ctype.includes("text/event-stream") || !res.body) {
        const d = (await res.json()) as { answer: string; sources?: Source[] };
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: d.answer };
          return next;
        });
        setSources(d.sources ?? []);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload) as {
              type: string;
              text?: string;
              sources?: Source[];
              answer?: string;
              simulated?: boolean;
            };
            if (evt.type === "sources" && evt.sources) {
              setSources(evt.sources);
            } else if (evt.type === "delta" && evt.text) {
              answer += evt.text;
              const snapshot = answer;
              setMessages((m) => {
                const next = [...m];
                next[next.length - 1] = {
                  role: "assistant",
                  content: snapshot,
                };
                return next;
              });
            } else if (evt.type === "error") {
              const msg = evt.answer || "Falha na IA";
              setMessages((m) => {
                const next = [...m];
                next[next.length - 1] = { role: "assistant", content: msg };
                return next;
              });
              if (evt.sources) setSources(evt.sources);
              if (!evt.simulated) toast.error(msg);
            }
          } catch {
            // ignore malformed SSE
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Erro";
      toast.error(msg);
      setMessages((m) => {
        const next = [...m];
        if (
          next[next.length - 1]?.role === "assistant" &&
          !next[next.length - 1].content
        ) {
          next.pop();
        }
        return next;
      });
    } finally {
      setPending(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void ask(input);
    }
  };

  const contextLabel = lessonTitle
    ? lessonTitle
    : courseTitle || "Material da turma";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]",
        compact ? "min-h-[320px]" : "min-h-[560px] lg:min-h-[640px]"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/20",
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            <Brain size={compact ? 16 : 18} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-900" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              Professor Virtual
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {subjectTitle ? `${subjectTitle} · ` : ""}
              {contextLabel}
            </p>
          </div>
        </div>
        {!compact && (
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 sm:inline-flex">
            <Sparkles size={12} />
            Online
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5",
          compact ? "max-h-[260px]" : "max-h-[min(58vh,520px)]"
        )}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-2 py-6 text-center animate-in fade-in duration-500">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400">
              <BookOpen size={26} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {lessonTitle
                ? "Tire dúvidas desta aula"
                : "Como posso ajudar nos estudos?"}
            </h3>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Faça perguntas sobre o conteúdo da turma. As respostas usam o
              material indexado e o contexto da disciplina.
            </p>
            <div className="mt-5 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending || !courseId}
                  onClick={() => void ask(s)}
                  className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const isStreaming =
            pending && i === messages.length - 1 && !isUser && !m.content;

          return (
            <div
              key={i}
              className={cn(
                "flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300",
                isUser && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isUser
                    ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    : "bg-brand-500 text-white"
                )}
              >
                {isUser ? <User size={14} /> : <Brain size={14} />}
              </div>
              <div
                className={cn(
                  "max-w-[min(100%,36rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "rounded-tr-md bg-brand-500 text-white"
                    : "rounded-tl-md border border-gray-100 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-white/[0.04] dark:text-gray-100"
                )}
              >
                {isStreaming ? (
                  <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Elaborando resposta…
                  </span>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {sources.length > 0 && (
        <details className="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800 sm:px-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            <FileText size={13} className="text-brand-500" />
            Fontes do material ({sources.length})
          </summary>
          <ul className="mt-2 max-h-28 space-y-2 overflow-y-auto">
            {sources.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-2 text-[11px] leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400"
              >
                <span className="mr-1.5 font-semibold text-brand-600 dark:text-brand-400">
                  {(s.score * 100).toFixed(0)}%
                </span>
                {s.content.slice(0, 160)}
                {s.content.length > 160 ? "…" : ""}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="border-t border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-white/[0.02] sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/15 dark:border-gray-800 dark:bg-gray-950/40">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={pending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              courseId
                ? "Escreva sua dúvida… (Enter para enviar)"
                : "Selecione uma turma para começar"
            }
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-gray-100"
          />
          <Button
            type="button"
            onClick={() => void ask(input)}
            disabled={pending || !input.trim() || !courseId}
            className="h-10 shrink-0 rounded-xl bg-brand-500 px-3.5 text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-gray-400">
          Shift+Enter para nova linha · Respostas orientadas pelo material da
          turma
        </p>
      </div>
    </div>
  );
}
