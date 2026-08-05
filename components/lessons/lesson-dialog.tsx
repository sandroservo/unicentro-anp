"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lessonCreateSchema, lessonUpdateSchema } from "@/lib/validations/lesson";
import { formatDuration } from "@/lib/utils";

export type LessonRow = {
  id: string; title: string; order: number;
  videoUrl?: string | null; description?: string | null;
};
type Props = { mode: "create" | "edit"; moduleId: string; lesson?: LessonRow; trigger: React.ReactElement };
type FormValues = { title: string; description?: string; videoUrl?: string; duration?: number; order?: number };

export function LessonDialog({ mode, moduleId, lesson, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const [fetchingYt, setFetchingYt] = useState(false);
  const [ytDuration, setYtDuration] = useState<number | null>(null);

  const { register, handleSubmit, reset, getValues, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(isEdit ? lessonUpdateSchema : lessonCreateSchema) as Resolver<FormValues>,
    });

  useEffect(() => {
    if (open) {
      reset({
        title: lesson?.title ?? "",
        description: lesson?.description ?? "",
        videoUrl: lesson?.videoUrl ?? "",
        order: lesson?.order ?? 0,
      });
      setYtDuration(null);
    }
  }, [open, lesson, reset]);

  async function fetchYouTube() {
    const url = getValues("videoUrl");
    if (!url) {
      toast.error("Informe a URL do vídeo primeiro");
      return;
    }
    setFetchingYt(true);
    try {
      const res = await fetch("/api/admin/youtube/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao buscar");
      if (!getValues("title")) setValue("title", data.title);
      setValue("duration", data.durationSeconds);
      setYtDuration(data.durationSeconds);
      toast.success(`Dados carregados: ${data.channelTitle}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFetchingYt(false);
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEdit ? `/api/admin/lessons/${lesson!.id}` : `/api/admin/modules/${moduleId}/lessons`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      toast.success(isEdit ? "Aula atualizada" : "Aula criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aula" : "Nova aula"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="videoUrl">URL do vídeo (YouTube)</Label>
            <div className="flex gap-2">
              <Input id="videoUrl" placeholder="https://youtube.com/watch?v=..." {...register("videoUrl")} />
              <Button type="button" variant="outline" onClick={fetchYouTube} disabled={fetchingYt}>
                <Youtube className="h-4 w-4 text-red-600" />
                {fetchingYt ? "..." : "Buscar"}
              </Button>
            </div>
            {errors.videoUrl && <p className="text-sm text-red-600">{errors.videoUrl.message}</p>}
            {ytDuration !== null && (
              <p className="text-xs text-muted-foreground">Duração: {formatDuration(ytDuration)}</p>
            )}
            <input type="hidden" {...register("duration")} />
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
