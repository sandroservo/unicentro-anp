"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Pencil, Archive, Search, Layers, GraduationCap } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CourseDialog } from "./course-dialog";

type CourseListItem = {
  id: string;
  title: string;
  description: string;
  code: string | null;
  workloadHours: number | null;
  isActive: boolean;
  aiPersona: string | null;
  aiContext: string | null;
  _count: { modules: number; enrollments: number };
};

async function fetchCourses(q: string): Promise<CourseListItem[]> {
  const res = await fetch(`/api/admin/courses?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Erro ao carregar cursos");
  return (await res.json()).courses;
}

export function CoursesTable({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", q],
    queryFn: () => fetchCourses(q),
  });

  const inactivate = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao inativar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curso inativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título ou código"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {canWrite && (
          <CourseDialog
            mode="create"
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Novo curso
              </Button>
            }
          />
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5} className="text-center text-gray-500">
                  Nenhum curso encontrado.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.code ?? "—"}</TableCell>
                  <TableCell>{c.workloadHours ? `${c.workloadHours}h` : "—"}</TableCell>
                  <TableCell>{c._count.modules}</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "default" : "secondary"}>
                      {c.isActive ? "ATIVO" : "INATIVO"}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Disciplinas" nativeButton={false} render={
                        <Link href={`/admin/cursos/${c.id}/disciplinas`}>
                          <Layers className="h-4 w-4" />
                        </Link>
                      } />
                      <Button variant="ghost" size="icon" aria-label="Notas" nativeButton={false} render={
                        <Link href={`/admin/cursos/${c.id}/notas`}>
                          <GraduationCap className="h-4 w-4" />
                        </Link>
                      } />
                      <CourseDialog
                        mode="edit"
                        course={c}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      {c.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Inativar"
                          onClick={() => inactivate.mutate(c.id)}
                        >
                          <Archive className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
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
