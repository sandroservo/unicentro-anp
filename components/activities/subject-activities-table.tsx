"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckSquare,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityDialog, type ActivityRow } from "./activity-dialog";
import { ActivityQuestionsDialog } from "./activity-questions-dialog";
import { SubjectActivityDialog } from "./subject-activity-dialog";

type SubjectActivity = ActivityRow & {
  lessonId: string;
  lesson: {
    id: string;
    title: string;
    module: { id: string; title: string };
  };
  _count: { activityQuestions: number; submissions: number };
};

export function SubjectActivitiesTable({
  subjectId,
  canWrite,
}: {
  subjectId: string;
  canWrite: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["subject-activities", subjectId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subjects/${subjectId}/activities`);
      if (!res.ok) throw new Error("Erro ao carregar atividades");
      return (await res.json()).activities as SubjectActivity[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-activities", subjectId],
      });
      toast.success("Atividade removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <SubjectActivityDialog
            subjectId={subjectId}
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Nova atividade
              </Button>
            }
          />
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Aula vinculada</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Submissões</TableHead>
              <TableHead>IA</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 6 : 5}
                  className="text-center text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 6 : 5}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma atividade vinculada a esta matéria.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.lesson.module.title} · {a.lesson.title}
                  </TableCell>
                  <TableCell>{a._count.activityQuestions}</TableCell>
                  <TableCell>{a._count.submissions}</TableCell>
                  <TableCell>
                    {a.aiGrading ? <Badge>IA</Badge> : "—"}
                  </TableCell>
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
                          lessonId={a.lessonId}
                          trigger={
                            <Button variant="ghost" size="sm" aria-label="Questões">
                              <ListChecks className="h-4 w-4" />
                              Questões
                            </Button>
                          }
                        />
                        <ActivityDialog
                          mode="edit"
                          lessonId={a.lessonId}
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
