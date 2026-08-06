"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type EnrollmentRow = {
  id: string;
  enrolledAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentProfile: { matricula: string; status: string } | null;
  };
};

type StudentOption = {
  id: string;
  userId: string;
  matricula: string;
  user: { id: string; name: string; email: string };
};

export function CourseEnrollments({
  courseId,
  canWrite,
}: {
  courseId: string;
  canWrite: boolean;
}) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["course-enrollments", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`);
      if (!res.ok) throw new Error("Erro ao carregar alunos da turma");
      return (await res.json()).enrollments as EnrollmentRow[];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-for-enroll", q],
    queryFn: async () => {
      const res = await fetch(`/api/admin/students?q=${encodeURIComponent(q)}&status=ATIVO`);
      if (!res.ok) throw new Error("Erro ao buscar alunos");
      return (await res.json()).students as StudentOption[];
    },
  });

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.user.id)),
    [enrollments]
  );

  const available = students.filter((s) => !enrolledIds.has(s.user.id));

  const add = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments", courseId] });
      toast.success("Aluno matriculado na turma");
      setSelectedUserId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/enrollments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments", courseId] });
      toast.success("Aluno removido da turma");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Adicionar aluno à turma
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou matrícula"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Selecione um aluno...</option>
              {available.map((s) => (
                <option key={s.user.id} value={s.user.id}>
                  {s.user.name} — {s.matricula} ({s.user.email})
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!selectedUserId || add.isPending}
            onClick={() => add.mutate(selectedUserId)}
          >
            <Plus className="h-4 w-4" /> Matricular
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Desde</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum aluno matriculado nesta turma.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.user.name}</div>
                    <div className="text-xs text-gray-500">{e.user.email}</div>
                  </TableCell>
                  <TableCell>{e.user.studentProfile?.matricula ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.user.studentProfile?.status === "ATIVO" ? "default" : "secondary"
                      }
                    >
                      {e.user.studentProfile?.status ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(e.enrolledAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remover"
                        onClick={() => {
                          if (confirm(`Remover ${e.user.name} da turma?`)) {
                            remove.mutate(e.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Remover</span>
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
