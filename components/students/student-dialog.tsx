"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentCreateSchema, studentUpdateSchema } from "@/lib/validations/student";

export type StudentRow = {
  id: string;
  matricula: string;
  phone: string | null;
  status: string;
  user: { id: string; name: string; email: string };
};

type Props = {
  mode: "create" | "edit";
  student?: StudentRow;
  trigger: React.ReactElement;
};

type FormValues = {
  name: string;
  email: string;
  matricula: string;
  phone?: string;
  password?: string;
};

export function StudentDialog({ mode, student, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      isEdit ? studentUpdateSchema : studentCreateSchema
    ) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit && student
          ? {
              name: student.user.name,
              email: student.user.email,
              matricula: student.matricula,
              phone: student.phone ?? "",
            }
          : { name: "", email: "", matricula: "", phone: "", password: "" }
      );
    }
  }, [open, isEdit, student, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/students/${student!.id}` : "/api/admin/students";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { name: values.name, matricula: values.matricula, phone: values.phone }
        : values;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao salvar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(isEdit ? "Aluno atualizado" : "Aluno criado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aluno" : "Novo aluno"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
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
            <Label htmlFor="matricula">Matrícula</Label>
            <Input id="matricula" {...register("matricula")} />
            {errors.matricula && (
              <p className="text-sm text-red-600">{errors.matricula.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          {!isEdit && (
            <div className="space-y-1">
              <Label htmlFor="password">Senha inicial</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}
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
