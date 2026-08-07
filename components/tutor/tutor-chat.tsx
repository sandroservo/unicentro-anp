"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Source = { content: string; score: number };

type TutorChatProps = {
  courseId?: string;
  lessonTitle?: string;
  lessonContent?: string;
  subjectTitle?: string;
  compact?: boolean;
};

export function TutorChat({
  courseId,
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

  const submit = async () => {
    const text = input.trim();
    if (!text || pending) return;

    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
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
          message: text,
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
          const line = part
            .split("\n")
            .find((l) => l.startsWith("data:"));
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
        if (next[next.length - 1]?.role === "assistant" && !next[next.length - 1].content) {
          next.pop();
        }
        return next;
      });
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  };

  return (
    <div className={cn(compact ? "space-y-3" : "max-w-2xl space-y-4")}>
      <div
        className={cn(
          "space-y-3 overflow-y-auto",
          compact ? "max-h-[280px] min-h-[160px]" : "min-h-[300px]"
        )}
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {lessonTitle
              ? `Pergunte sobre a aula “${lessonTitle}” ou o material da turma.`
              : "Pergunte algo sobre o material do curso."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex gap-2", m.role === "user" && "justify-end")}
          >
            {m.role === "assistant" && (
              <Bot className="h-6 w-6 shrink-0 text-primary" />
            )}
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {m.content || (pending && i === messages.length - 1 ? "…" : "")}
            </div>
            {m.role === "user" && (
              <User className="h-6 w-6 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {sources.length > 0 && (
        <details className="rounded border p-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">
            Fontes do material ({sources.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {sources.map((s, i) => (
              <li key={i}>
                [{s.score.toFixed(2)}] {s.content.slice(0, 120)}...
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={pending}
        />
        <Button onClick={submit} disabled={pending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
