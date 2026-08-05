"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Sub = {
  id: string;
  answers: string;
  aiGrade: number | null;
  finalGrade: number | null;
  aiFeedback: string | null;
  attempt: number;
  user: { name: string; email: string };
};

export function SubmissionsList({ activityId, canWrite }: { activityId: string; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", activityId],
    queryFn: async () => (await (await fetch(`/api/admin/activities/${activityId}/submissions`)).json()).submissions as Sub[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["submissions", activityId] });

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;
  if (submissions.length === 0) return <p className="text-gray-500">Nenhuma submissão.</p>;

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} sub={s} canWrite={canWrite} onChange={invalidate} />
      ))}
    </div>
  );
}

function SubmissionCard({ sub, canWrite, onChange }: { sub: Sub; canWrite: boolean; onChange: () => void }) {
  const [grade, setGrade] = useState(sub.finalGrade?.toString() ?? "");
  const [feedback, setFeedback] = useState(sub.aiFeedback ?? "");

  const gradeAI = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/submissions/${sub.id}/grade-ai`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro");
      return d;
    },
    onSuccess: (d) => { toast.success(`Corrigido pela IA: nota ${d.finalGrade}`); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const manual = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/submissions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalGrade: Number(grade), feedback }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro");
    },
    onSuccess: () => { toast.success("Nota salva"); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{sub.user.name}</p>
          <p className="text-xs text-gray-500">{sub.user.email} · tentativa {sub.attempt}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">objetivo: {sub.aiGrade ?? "—"}</span>
          <Badge variant={sub.finalGrade != null ? "default" : "secondary"}>
            {sub.finalGrade != null ? `nota ${sub.finalGrade}` : "sem nota"}
          </Badge>
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600">Respostas</summary>
        <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">{sub.answers}</pre>
      </details>

      {canWrite && (
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={() => gradeAI.mutate()} disabled={gradeAI.isPending}>
            <Sparkles className="h-4 w-4" /> {gradeAI.isPending ? "Corrigindo..." : "Corrigir com IA"}
          </Button>
          <div className="flex items-end gap-2">
            <div className="w-28">
              <label className="text-xs text-gray-500">Nota final</label>
              <Input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => manual.mutate()} disabled={manual.isPending}>Salvar nota</Button>
          </div>
          <Textarea rows={2} placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
      )}
      {!canWrite && sub.aiFeedback && <p className="text-sm text-gray-600 whitespace-pre-line">{sub.aiFeedback}</p>}
    </div>
  );
}
