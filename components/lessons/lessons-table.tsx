"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Pencil, Trash2, Youtube, ClipboardList, FileText } from "lucide-react";
import { TranscriptDialog } from "./transcript-dialog";
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
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Vídeo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : lessons.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma aula.</TableCell></TableRow>
            ) : (
              lessons.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.order}</TableCell>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell>
                    {l.videoUrl ? <Youtube className="h-4 w-4 text-red-600" /> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" aria-label="Atividades" nativeButton={false} render={
                      <Link href={`/admin/aulas/${l.id}/atividades`}><ClipboardList className="h-4 w-4" /></Link>
                    } />
                    {canWrite && (
                      <>
                        <TranscriptDialog lessonId={l.id}
                          trigger={<Button variant="ghost" size="icon" aria-label="Transcrição"><FileText className="h-4 w-4" /></Button>} />
                        <LessonDialog mode="edit" moduleId={moduleId} lesson={l}
                          trigger={<Button variant="ghost" size="icon" aria-label="Editar"><Pencil className="h-4 w-4" /></Button>} />
                        <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove.mutate(l.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
