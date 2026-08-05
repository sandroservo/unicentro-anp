"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { questionCreateSchema, QUESTION_TYPES } from "@/lib/validations/question";

export type QuestionRow = {
  id: string;
  type: string;
  statement: string;
  options: string | null;
  answerKey: string | null;
  points: number;
  categoryId: string | null;
};

type Props = { mode: "create" | "edit"; question?: QuestionRow; trigger: React.ReactElement };
type Opt = { text: string; correct: boolean };
type FormValues = {
  type: (typeof QUESTION_TYPES)[number];
  statement: string;
  options: Opt[];
  answerKey?: string;
  points?: number;
  categoryId?: string;
};

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: "Múltipla escolha",
  TRUE_FALSE: "Verdadeiro/Falso",
  ESSAY: "Dissertativa",
};

export function QuestionDialog({ mode, question, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const { data: categories = [] } = useQuery({
    queryKey: ["question-categories"],
    queryFn: async () => (await (await fetch("/api/admin/question-categories")).json()).categories as { id: string; name: string }[],
    enabled: open,
  });

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(questionCreateSchema) as Resolver<FormValues>,
    defaultValues: { type: "MULTIPLE_CHOICE", statement: "", options: [], points: 1 },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const type = watch("type");
  const needsOptions = type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

  useEffect(() => {
    if (open) {
      const opts: Opt[] = question?.options ? JSON.parse(question.options) : [];
      reset({
        type: (question?.type as FormValues["type"]) ?? "MULTIPLE_CHOICE",
        statement: question?.statement ?? "",
        options: opts,
        answerKey: question?.answerKey ?? "",
        points: question?.points ?? 1,
        categoryId: question?.categoryId ?? "",
      });
    }
  }, [open, question, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/questions/${question!.id}` : "/api/admin/questions";
      const payload = { ...values, options: needsOptions ? values.options : undefined };
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success(isEdit ? "Questão atualizada" : "Questão criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar questão" : "Nova questão"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <select id="type" className="w-full h-9 rounded-md border px-2 text-sm" {...register("type")}>
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="points">Pontos</Label>
              <Input id="points" type="number" {...register("points")} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="statement">Enunciado</Label>
            <Textarea id="statement" rows={2} {...register("statement")} />
            {errors.statement && <p className="text-sm text-red-600">{errors.statement.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="categoryId">Categoria</Label>
            <select id="categoryId" className="w-full h-9 rounded-md border px-2 text-sm" {...register("categoryId")}>
              <option value="">— sem categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {needsOptions ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Alternativas</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "", correct: false })}>
                  <Plus className="h-3 w-3" /> Alternativa
                </Button>
              </div>
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input type="checkbox" {...register(`options.${i}.correct`)} title="Correta" />
                  <Input placeholder={`Alternativa ${i + 1}`} {...register(`options.${i}.text`)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remover">
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              {errors.options && <p className="text-sm text-red-600">{errors.options.message as string}</p>}
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="answerKey">Rubrica / gabarito</Label>
              <Textarea id="answerKey" rows={2} placeholder="Critérios de correção" {...register("answerKey")} />
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
