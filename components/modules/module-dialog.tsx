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
import { Textarea } from "@/components/ui/textarea";
import { moduleCreateSchema, moduleUpdateSchema } from "@/lib/validations/lesson";

export type ModuleRow = { id: string; title: string; order: number; description?: string | null };
type Props = { mode: "create" | "edit"; subjectId: string; module?: ModuleRow; trigger: React.ReactElement };
type FormValues = { title: string; description?: string; order?: number };

export function ModuleDialog({ mode, subjectId, module, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? moduleUpdateSchema : moduleCreateSchema) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) reset({ title: module?.title ?? "", description: module?.description ?? "", order: module?.order ?? 0 });
  }, [open, module, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/modules/${module!.id}` : `/api/admin/subjects/${subjectId}/modules`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", subjectId] });
      toast.success(isEdit ? "Módulo atualizado" : "Módulo criado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar módulo" : "Novo módulo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="order">Ordem</Label>
            <Input id="order" type="number" {...register("order")} />
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
