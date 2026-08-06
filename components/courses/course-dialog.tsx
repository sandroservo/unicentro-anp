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
import { Textarea } from "@/components/ui/textarea";
import { courseCreateSchema, courseUpdateSchema } from "@/lib/validations/course";

export type CourseRow = {
  id: string;
  title: string;
  code: string | null;
  workloadHours: number | null;
  isActive: boolean;
};

type Props = {
  mode: "create" | "edit";
  course?: CourseRow & { description?: string; aiPersona?: string | null; aiContext?: string | null };
  trigger: React.ReactElement;
};

type FormValues = {
  title: string;
  description: string;
  code?: string;
  workloadHours?: number;
  aiPersona?: string;
  aiContext?: string;
};

export function CourseDialog({ mode, course, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? courseUpdateSchema : courseCreateSchema) as Resolver<FormValues>,
  });

  useEffect(() => {
    if (open) {
      reset({
        title: course?.title ?? "",
        description: course?.description ?? "",
        code: course?.code ?? "",
        workloadHours: course?.workloadHours ?? undefined,
        aiPersona: course?.aiPersona ?? "",
        aiContext: course?.aiContext ?? "",
      });
    }
  }, [open, course, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/courses/${course!.id}` : "/api/admin/courses";
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
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(isEdit ? "Turma atualizada" : "Turma criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar turma" : "Nova turma"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code">Código</Label>
              <Input id="code" {...register("code")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="workloadHours">Carga horária (h)</Label>
              <Input id="workloadHours" type="number" {...register("workloadHours")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="aiPersona">Persona da IA</Label>
            <Input id="aiPersona" {...register("aiPersona")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="aiContext">Contexto/Ementa para a IA</Label>
            <Textarea id="aiContext" rows={3} {...register("aiContext")} />
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
