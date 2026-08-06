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
import { activityCreateSchema, activityUpdateSchema } from "@/lib/validations/activity";

export type ActivityRow = {
  id: string;
  title: string;
  description?: string | null;
  maxAttempts?: number;
  aiGrading?: boolean;
};
type Props = { mode: "create" | "edit"; lessonId: string; activity?: ActivityRow; trigger: React.ReactElement };
type FormValues = { title: string; description?: string; maxAttempts?: number; aiGrading?: boolean };

export function ActivityDialog({ mode, lessonId, activity, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? activityUpdateSchema : activityCreateSchema) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) reset({
      title: activity?.title ?? "",
      description: activity?.description ?? "",
      maxAttempts: activity?.maxAttempts ?? 3,
      aiGrading: activity?.aiGrading ?? false,
    });
  }, [open, activity, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/activities/${activity!.id}` : `/api/admin/lessons/${lessonId}/activities`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["subject-activities"] });
      toast.success(isEdit ? "Atividade atualizada" : "Atividade criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? "Editar atividade" : "Nova atividade"}</DialogTitle></DialogHeader>
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
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="maxAttempts">Tentativas máx.</Label>
              <Input id="maxAttempts" type="number" {...register("maxAttempts")} />
            </div>
            <label className="flex items-center gap-2 text-sm h-9">
              <input type="checkbox" {...register("aiGrading")} /> Correção por IA
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
