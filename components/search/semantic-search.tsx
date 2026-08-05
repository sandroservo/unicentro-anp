"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Result = { content: string; score: number; source: string; lessonId: string | null };

export function SemanticSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);

  const run = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(`/api/aluno/search?q=${encodeURIComponent(query)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro");
      return d.results as Result[];
    },
    onSuccess: (r) => setResults(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    const query = q.trim();
    if (!query || run.isPending) return;
    run.mutate(query);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Buscar no material do curso..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <Button onClick={submit} disabled={run.isPending}>
          {run.isPending ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {results && (
        results.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum resultado.</p>
        ) : (
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="rounded-lg border bg-white p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{r.source}</Badge>
                  <span className="text-xs text-gray-400">relevância {r.score.toFixed(2)}</span>
                </div>
                <p className="text-sm">{r.content}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
