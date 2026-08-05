"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Q = { id: string; type: string; statement: string; points: number; options: { text: string }[] | null };
type Data = { activity: { id: string; title: string; description: string | null }; questions: Q[] };

export function ActivityTake({ activityId }: { activityId: string }) {
  const [answers, setAnswers] = useState<Record<string, number[] | string>>({});
  const [result, setResult] = useState<{ objectivePoints: number; pendingEssayGrading: boolean; finalGrade: number | null } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["aluno-activity", activityId],
    queryFn: async () => {
      const res = await fetch(`/api/aluno/activities/${activityId}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      return (await res.json()) as Data;
    },
  });

  const toggleOption = (qid: string, idx: number) =>
    setAnswers((a) => {
      const cur = Array.isArray(a[qid]) ? (a[qid] as number[]) : [];
      return { ...a, [qid]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] };
    });

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/aluno/activities/${activityId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro ao submeter");
      return d;
    },
    onSuccess: (d) => {
      setResult(d);
      toast.success("Atividade enviada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !data) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{data.activity.title}</h2>
        {data.activity.description && <p className="text-gray-600">{data.activity.description}</p>}
      </div>

      {result ? (
        <div className="rounded-lg border bg-green-50 p-4 space-y-1">
          <p className="font-medium text-green-800">Enviado!</p>
          <p className="text-sm">Pontos objetivos: {result.objectivePoints}</p>
          {result.pendingEssayGrading ? (
            <p className="text-sm text-gray-600">Questões dissertativas aguardam correção.</p>
          ) : (
            <p className="text-sm">Nota final: {result.finalGrade}</p>
          )}
        </div>
      ) : (
        <>
          {data.questions.map((q, qi) => (
            <div key={q.id} className="rounded-lg border bg-white p-4 space-y-2">
              <p className="font-medium">
                {qi + 1}. {q.statement} <span className="text-gray-400 text-sm">({q.points}pt)</span>
              </p>
              {q.options ? (
                <div className="space-y-1">
                  {q.options.map((o, oi) => (
                    <label key={oi} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.id]) && (answers[q.id] as number[]).includes(oi)}
                        onChange={() => toggleOption(q.id, oi)}
                      />
                      {o.text}
                    </label>
                  ))}
                </div>
              ) : (
                <Textarea
                  rows={3}
                  placeholder="Sua resposta"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || data.questions.length === 0}>
            {submit.isPending ? "Enviando..." : "Enviar respostas"}
          </Button>
        </>
      )}
    </div>
  );
}
