"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { subjectActivityCreateSchema } from "@/lib/validations/activity";
import { z } from "zod";

type FormValues = z.infer<typeof subjectActivityCreateSchema>;

type Props = {
  subjectId: string;
  trigger: React.ReactElement;
};

export function SubjectActivityDialog({ subjectId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: lessons = [] } = useQuery({
    queryKey: ["subject-lessons", subjectId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subjects/${subjectId}/lessons`);
      if (!res.ok) throw new Error("Erro ao carregar aulas");
      return (await res.json()).lessons as {
        id: string;
        title: string;
        moduleTitle: string;
        label: string;
      }[];
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(subjectActivityCreateSchema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      description: "",
      maxAttempts: 3,
      aiGrading: false,
      lessonId: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        description: "",
        maxAttempts: 3,
        aiGrading: false,
        lessonId: lessons[0]?.id ?? "",
      });
    }
  }, [open, lessons, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch(`/api/admin/subjects/${subjectId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => ({}))).error ?? "Erro ao salvar"
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-activities", subjectId],
      });
      toast.success("Atividade cadastrada e vinculada à matéria");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atividade da matéria</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="lessonId">Vincular à aula</Label>
            <select
              id="lessonId"
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              {...register("lessonId")}
              disabled={lessons.length === 0}
            >
              {lessons.length === 0 ? (
                <option value="">Cadastre uma aula nesta matéria primeiro</option>
              ) : (
                lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))
              )}
            </select>
            {errors.lessonId && (
              <p className="text-sm text-red-600">{errors.lessonId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A atividade fica disponível para os alunos vinculados a esta matéria.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="maxAttempts">Tentativas máx.</Label>
              <Input
                id="maxAttempts"
                type="number"
                {...register("maxAttempts")}
              />
            </div>
            <label className="flex h-9 items-center gap-2 text-sm">
              <input type="checkbox" {...register("aiGrading")} /> Correção por IA
            </label>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending || lessons.length === 0}
            >
              {mutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
