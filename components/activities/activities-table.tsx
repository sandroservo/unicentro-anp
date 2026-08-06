"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Pencil, Trash2, ListChecks, CheckSquare } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityDialog, type ActivityRow } from "./activity-dialog";
import { ActivityQuestionsDialog } from "./activity-questions-dialog";

type ActivityItem = ActivityRow & { _count: { activityQuestions: number; submissions: number } };

async function fetchActivities(lessonId: string): Promise<ActivityItem[]> {
  const res = await fetch(`/api/admin/lessons/${lessonId}/activities`);
  if (!res.ok) throw new Error("Erro ao carregar atividades");
  return (await res.json()).activities;
}

export function ActivitiesTable({ lessonId, canWrite }: { lessonId: string; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", lessonId],
    queryFn: () => fetchActivities(lessonId),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", lessonId] });
      toast.success("Atividade removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <ActivityDialog mode="create" lessonId={lessonId}
            trigger={<Button><Plus className="h-4 w-4" /> Nova atividade</Button>} />
        )}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Submissões</TableHead>
              <TableHead>IA</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={canWrite ? 5 : 4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : activities.length === 0 ? (
              <TableRow><TableCell colSpan={canWrite ? 5 : 4} className="text-center text-muted-foreground">Nenhuma atividade.</TableCell></TableRow>
            ) : (
              activities.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a._count.activityQuestions}</TableCell>
                  <TableCell>{a._count.submissions}</TableCell>
                  <TableCell>{a.aiGrading ? <Badge>IA</Badge> : "—"}</TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Correção"
                          nativeButton={false}
                          render={
                            <Link href={`/admin/atividades/${a.id}/correcao`}>
                              <CheckSquare className="h-4 w-4" />
                              Correção
                            </Link>
                          }
                        />
                        <ActivityQuestionsDialog
                          activityId={a.id}
                          lessonId={lessonId}
                          trigger={
                            <Button variant="ghost" size="sm" aria-label="Questões">
                              <ListChecks className="h-4 w-4" />
                              Questões
                            </Button>
                          }
                        />
                        <ActivityDialog
                          mode="edit"
                          lessonId={lessonId}
                          activity={a}
                          trigger={
                            <Button variant="ghost" size="sm" aria-label="Editar">
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Remover"
                          onClick={() => remove.mutate(a.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">Remover</span>
                        </Button>
                      </div>
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
