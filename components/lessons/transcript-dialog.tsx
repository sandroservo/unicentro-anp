"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TranscriptDialog({ lessonId, trigger }: { lessonId: string; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const save = useMutation({
    mutationFn: async (useText: boolean) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useText ? { text } : {}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro");
      return d;
    },
    onSuccess: (d) => {
      toast.success(`Transcrição salva e indexada (${d.chunkCount} chunks)`);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader><DialogTitle>Transcrição da aula</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Cole a transcrição, ou busque as legendas do YouTube automaticamente.
          </p>
          <Textarea rows={6} placeholder="Transcrição..." value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => save.mutate(false)} disabled={save.isPending}>
            Buscar do YouTube
          </Button>
          <Button onClick={() => save.mutate(true)} disabled={save.isPending || !text.trim()}>
            Salvar texto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
