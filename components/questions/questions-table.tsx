"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuestionDialog, type QuestionRow } from "./question-dialog";

type QuestionItem = QuestionRow & { category: { name: string } | null };

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: "Múltipla",
  TRUE_FALSE: "V/F",
  ESSAY: "Dissertativa",
};

async function fetchQuestions(q: string, type: string): Promise<QuestionItem[]> {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (type) p.set("type", type);
  const res = await fetch(`/api/admin/questions?${p.toString()}`);
  if (!res.ok) throw new Error("Erro ao carregar questões");
  return (await res.json()).questions;
}

export function QuestionsTable({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", q, type],
    queryFn: () => fetchQuestions(q, type),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Questão removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar enunciado" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <select className="h-9 rounded-md border px-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="MULTIPLE_CHOICE">Múltipla</option>
            <option value="TRUE_FALSE">V/F</option>
            <option value="ESSAY">Dissertativa</option>
          </select>
        </div>
        {canWrite && (
          <QuestionDialog mode="create" trigger={<Button><Plus className="h-4 w-4" /> Nova questão</Button>} />
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enunciado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pontos</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={canWrite ? 5 : 4} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
            ) : questions.length === 0 ? (
              <TableRow><TableCell colSpan={canWrite ? 5 : 4} className="text-center text-gray-500">Nenhuma questão.</TableCell></TableRow>
            ) : (
              questions.map((qn) => (
                <TableRow key={qn.id}>
                  <TableCell className="font-medium max-w-md truncate">{qn.statement}</TableCell>
                  <TableCell><Badge variant="secondary">{TYPE_LABEL[qn.type] ?? qn.type}</Badge></TableCell>
                  <TableCell>{qn.category?.name ?? "—"}</TableCell>
                  <TableCell>{qn.points}</TableCell>
                  {canWrite && (
                    <TableCell className="text-right space-x-1">
                      <QuestionDialog mode="edit" question={qn}
                        trigger={<Button variant="ghost" size="icon" aria-label="Editar"><Pencil className="h-4 w-4" /></Button>} />
                      <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove.mutate(qn.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
