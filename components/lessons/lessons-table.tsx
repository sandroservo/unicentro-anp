"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Youtube } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LessonDialog, type LessonRow } from "./lesson-dialog";

async function fetchLessons(moduleId: string): Promise<LessonRow[]> {
  const res = await fetch(`/api/admin/modules/${moduleId}/lessons`);
  if (!res.ok) throw new Error("Erro ao carregar aulas");
  return (await res.json()).lessons;
}

export function LessonsTable({ moduleId, canWrite }: { moduleId: string; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: () => fetchLessons(moduleId),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      toast.success("Aula removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <LessonDialog mode="create" moduleId={moduleId}
            trigger={<Button><Plus className="h-4 w-4" /> Nova aula</Button>} />
        )}
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Vídeo</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={canWrite ? 4 : 3} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
            ) : lessons.length === 0 ? (
              <TableRow><TableCell colSpan={canWrite ? 4 : 3} className="text-center text-gray-500">Nenhuma aula.</TableCell></TableRow>
            ) : (
              lessons.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.order}</TableCell>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell>
                    {l.videoUrl ? <Youtube className="h-4 w-4 text-red-600" /> : <span className="text-gray-400">—</span>}
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right space-x-1">
                      <LessonDialog mode="edit" moduleId={moduleId} lesson={l}
                        trigger={<Button variant="ghost" size="icon" aria-label="Editar"><Pencil className="h-4 w-4" /></Button>} />
                      <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove.mutate(l.id)}>
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
