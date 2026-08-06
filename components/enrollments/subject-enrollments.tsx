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

type CourseEnrollmentRow = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentProfile: { matricula: string; status: string } | null;
  };
};

export function SubjectEnrollments({
  subjectId,
  courseId,
  canWrite,
}: {
  subjectId: string;
  courseId: string;
  canWrite: boolean;
}) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["subject-enrollments", subjectId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subjects/${subjectId}/enrollments`);
      if (!res.ok) throw new Error("Erro ao carregar vínculos");
      return (await res.json()).enrollments as EnrollmentRow[];
    },
  });

  const { data: turmaAlunos = [] } = useQuery({
    queryKey: ["course-enrollments", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`);
      if (!res.ok) throw new Error("Erro ao carregar alunos da turma");
      return (await res.json()).enrollments as CourseEnrollmentRow[];
    },
  });

  const linkedIds = useMemo(
    () => new Set(enrollments.map((e) => e.user.id)),
    [enrollments]
  );

  const available = turmaAlunos.filter((e) => {
    if (linkedIds.has(e.user.id)) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      e.user.name.toLowerCase().includes(needle) ||
      e.user.email.toLowerCase().includes(needle) ||
      (e.user.studentProfile?.matricula ?? "").toLowerCase().includes(needle)
    );
  });

  const add = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/subjects/${subjectId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-enrollments", subjectId] });
      toast.success("Aluno vinculado à matéria");
      setSelectedUserId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/subject-enrollments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao remover vínculo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-enrollments", subjectId] });
      toast.success("Vínculo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Vincular aluno da turma a esta matéria
            </label>
            <p className="text-xs text-gray-500">
              Só alunos já matriculados na turma aparecem aqui. Ao vincular, eles passam a
              assistir as aulas e ver as notas desta matéria.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Filtrar alunos da turma"
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
              <option value="">
                {turmaAlunos.length === 0
                  ? "Nenhum aluno na turma — matricule na turma primeiro"
                  : "Selecione um aluno da turma..."}
              </option>
              {available.map((e) => (
                <option key={e.user.id} value={e.user.id}>
                  {e.user.name} — {e.user.studentProfile?.matricula ?? "—"}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!selectedUserId || add.isPending}
            onClick={() => add.mutate(selectedUserId)}
          >
            <Plus className="h-4 w-4" /> Vincular
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Desde</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum aluno vinculado a esta matéria.
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
                    {new Date(e.enrolledAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remover vínculo"
                        onClick={() => {
                          if (confirm(`Desvincular ${e.user.name} desta matéria?`)) {
                            remove.mutate(e.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Desvincular</span>
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
