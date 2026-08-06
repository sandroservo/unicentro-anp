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
import { subjectCreateSchema, subjectUpdateSchema } from "@/lib/validations/subject";

export type SubjectRow = {
  id: string;
  title: string;
  code: string | null;
  order: number;
};

type Props = {
  mode: "create" | "edit";
  courseId: string;
  subject?: SubjectRow;
  trigger: React.ReactElement;
};

type FormValues = { title: string; code?: string; order?: number };

export function SubjectDialog({ mode, courseId, subject, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? subjectUpdateSchema : subjectCreateSchema) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) {
      reset({
        title: subject?.title ?? "",
        code: subject?.code ?? "",
        order: subject?.order ?? 0,
      });
    }
  }, [open, subject, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit
        ? `/api/admin/subjects/${subject!.id}`
        : `/api/admin/courses/${courseId}/subjects`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao salvar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", courseId] });
      toast.success(isEdit ? "Matéria atualizada" : "Matéria criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar matéria" : "Nova matéria"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code">Código</Label>
              <Input id="code" {...register("code")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order">Ordem</Label>
              <Input id="order" type="number" {...register("order")} />
            </div>
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
