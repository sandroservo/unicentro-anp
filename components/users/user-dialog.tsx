"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userCreateSchema, userUpdateSchema, ROLE_OPTIONS } from "@/lib/validations/user";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  roleRel: { slug: string; name: string } | null;
};
type Props = { mode: "create" | "edit"; user?: UserRow; trigger: React.ReactElement };
type FormValues = { name: string; email?: string; password?: string; role: string };

export function UserDialog({ mode, user, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? userUpdateSchema : userCreateSchema) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        role: user?.roleRel?.slug ?? "ALUNO",
      });
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/users/${user!.id}` : "/api/admin/users";
      const body = isEdit
        ? { name: values.name, role: values.role, password: values.password }
        : values;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isEdit ? "Usuário atualizado" : "Usuário criado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          {!isEdit && (
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="role">Tipo de usuário</Label>
            <select id="role" className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm" {...register("role")}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{isEdit ? "Nova senha (opcional)" : "Senha"}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
