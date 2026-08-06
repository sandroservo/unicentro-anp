"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, PlayCircle } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ModuleDialog, type ModuleRow } from "./module-dialog";

type ModuleListItem = ModuleRow & { _count: { lessons: number } };

async function fetchModules(subjectId: string): Promise<ModuleListItem[]> {
  const res = await fetch(`/api/admin/subjects/${subjectId}/modules`);
  if (!res.ok) throw new Error("Erro ao carregar módulos");
  return (await res.json()).modules;
}

export function ModulesTable({ subjectId, canWrite }: { subjectId: string; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["modules", subjectId],
    queryFn: () => fetchModules(subjectId),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", subjectId] });
      toast.success("Módulo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite && (
          <ModuleDialog mode="create" subjectId={subjectId}
            trigger={<Button><Plus className="h-4 w-4" /> Novo módulo</Button>} />
        )}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Aulas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : modules.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum módulo.</TableCell></TableRow>
            ) : (
              modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.order}</TableCell>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell>{m._count.lessons}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Aulas"
                        nativeButton={false}
                        render={
                          <Link href={`/admin/modulos/${m.id}`}>
                            <PlayCircle className="h-4 w-4" />
                            Aulas
                          </Link>
                        }
                      />
                      {canWrite && (
                        <>
                          <ModuleDialog
                            mode="edit"
                            subjectId={subjectId}
                            module={m}
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
                            onClick={() => remove.mutate(m.id)}
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
