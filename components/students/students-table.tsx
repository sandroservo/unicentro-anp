"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, UserX, Search } from "lucide-react";
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
import { StudentDialog, type StudentRow } from "./student-dialog";

async function fetchStudents(q: string): Promise<StudentRow[]> {
  const res = await fetch(`/api/admin/students?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Erro ao carregar alunos");
  return (await res.json()).students;
}

export function StudentsTable({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", q],
    queryFn: () => fetchStudents(q),
  });

  const inactivate = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao inativar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno inativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou matrícula"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {canWrite && (
          <StudentDialog
            mode="create"
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Novo aluno
              </Button>
            }
          />
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-gray-500">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user.name}</TableCell>
                  <TableCell>{s.user.email}</TableCell>
                  <TableCell>{s.matricula}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "ATIVO" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right space-x-1">
                      <StudentDialog
                        mode="edit"
                        student={s}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      {s.status === "ATIVO" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Inativar"
                          onClick={() => inactivate.mutate(s.id)}
                        >
                          <UserX className="h-4 w-4 text-red-600" />
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
