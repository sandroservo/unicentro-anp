"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Source = { content: string; score: number };

type TutorChatProps = {
  courseId?: string;
  compact?: boolean;
};

export function TutorChat({ courseId, compact = false }: TutorChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sources, setSources] = useState<Source[]>([]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/aluno/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          courseId: courseId || undefined,
          history: messages.slice(-6),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro");
      return d as { answer: string; sources: Source[] };
    },
    onSuccess: (d) => {
      setMessages((m) => [...m, { role: "assistant", content: d.answer }]);
      setSources(d.sources ?? []);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    const text = input.trim();
    if (!text || send.isPending) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    send.mutate(text);
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
            Pergunte algo sobre o material do curso.
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
                "max-w-[80%] whitespace-pre-line rounded-lg px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <User className="h-6 w-6 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
        {send.isPending && (
          <p className="text-sm text-muted-foreground">Pensando...</p>
        )}
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
        />
        <Button onClick={submit} disabled={send.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
