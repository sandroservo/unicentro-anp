"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SubjectDialog, type SubjectRow } from "./subject-dialog";

type SubjectListItem = SubjectRow & { _count: { modules: number } };

async function fetchSubjects(courseId: string): Promise<SubjectListItem[]> {
  const res = await fetch(`/api/admin/courses/${courseId}/subjects`);
  if (!res.ok) throw new Error("Erro ao carregar disciplinas");
  return (await res.json()).subjects;
}

export function SubjectsTable({
  courseId,
  canWrite,
}: {
  courseId: string;
  canWrite: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", courseId],
    queryFn: () => fetchSubjects(courseId),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", courseId] });
      toast.success("Matéria removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <SubjectDialog
            mode="create"
            courseId={courseId}
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Nova matéria
              </Button>
            }
          />
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma disciplina.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.order}</TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.code ?? "—"}</TableCell>
                  <TableCell>{s._count.modules}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Gerenciar matéria"
                        nativeButton={false}
                        render={
                          <Link href={`/admin/disciplinas/${s.id}`}>
                            <Layers className="h-4 w-4" />
                            Gerenciar
                          </Link>
                        }
                      />
                      {canWrite && (
                        <>
                          <SubjectDialog
                            mode="edit"
                            courseId={courseId}
                            subject={s}
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
                            onClick={() => remove.mutate(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Remover</span>
                          </Button>
                        </>
                      )}
                    </div>
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
