"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserDialog, type UserRow } from "./user-dialog";
import { ROLE_OPTIONS } from "@/lib/validations/user";

async function fetchUsers(q: string, role: string): Promise<UserRow[]> {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (role) p.set("role", role);
  const res = await fetch(`/api/admin/users?${p.toString()}`);
  if (!res.ok) throw new Error("Erro ao carregar usuários");
  return (await res.json()).users;
}

export function UsersTable() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", q, role],
    queryFn: () => fetchUsers(q, role),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao remover");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar nome ou email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Todos os tipos</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>
        <UserDialog mode="create" trigger={<Button><Plus className="h-4 w-4" /> Novo usuário</Button>} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum usuário.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.roleRel?.name ?? "—"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <UserDialog
                        mode="edit"
                        user={u}
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
                        onClick={() => remove.mutate(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Remover</span>
                      </Button>
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
