"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Q = { id: string; statement: string; type: string; points: number };

export function ActivityQuestionsDialog({
  activityId, lessonId, trigger,
}: { activityId: string; lessonId: string; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: bank = [] } = useQuery({
    queryKey: ["questions-bank"],
    queryFn: async () => (await (await fetch("/api/admin/questions")).json()).questions as Q[],
    enabled: open,
  });
  const { data: current = [] } = useQuery({
    queryKey: ["activity-questions", activityId],
    queryFn: async () => (await (await fetch(`/api/admin/activities/${activityId}/questions`)).json()).questions as Q[],
    enabled: open,
  });

  useEffect(() => {
    if (open) setSelected(current.map((q) => q.id));
  }, [open, current]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/activities/${activityId}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: selected }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["activity-questions", activityId] });
      toast.success("Questões atualizadas");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Questões da atividade</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {bank.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma questão no banco.</p>
          ) : (
            bank.map((q) => (
              <label key={q.id} className="flex items-start gap-2 text-sm border rounded p-2">
                <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} className="mt-1" />
                <span className="flex-1">
                  <span className="font-medium">{q.statement}</span>
                  <span className="text-gray-500"> · {q.type} · {q.points}pt</span>
                </span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <span className="text-sm text-gray-500 mr-auto self-center">{selected.length} selecionada(s)</span>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
