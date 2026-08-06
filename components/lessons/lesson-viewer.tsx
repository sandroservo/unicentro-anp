"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { TutorChat } from "@/components/tutor/tutor-chat";
import { YouTubePlayer } from "@/components/lessons/youtube-player";

type Material = {
  id: string;
  title: string;
  type: string;
  url: string;
};

type LessonViewerProps = {
  cursoId: string;
  courseTitle: string;
  subjectTitle?: string | null;
  moduleTitle: string;
  moduleDescription?: string | null;
  lesson: {
    id: string;
    title: string;
    description: string | null;
    videoId: string | null;
    transcript: string | null;
  };
  materials: Material[];
  initialCompleted?: boolean;
  initialVideoProgress?: number;
  /** Admin em pré-visualização — pode concluir sem assistir */
  allowCompleteWithoutWatch?: boolean;
};

type SideTab = "conceito" | "materiais" | "transcricao";

export function LessonViewer({
  cursoId,
  courseTitle,
  subjectTitle,
  moduleTitle,
  moduleDescription,
  lesson,
  materials,
  initialCompleted = false,
  initialVideoProgress = 0,
  allowCompleteWithoutWatch = false,
}: LessonViewerProps) {
  const [tab, setTab] = useState<SideTab>("conceito");
  const [completed, setCompleted] = useState(initialCompleted);
  const [watchedComplete, setWatchedComplete] = useState(
    initialCompleted || initialVideoProgress >= 95 || !lesson.videoId
  );
  const lastSavedProgress = useRef(initialVideoProgress);

  const tabs: { id: SideTab; label: string; icon: typeof BookOpen }[] = [
    { id: "conceito", label: "Conceito", icon: BookOpen },
    { id: "materiais", label: "Materiais", icon: FileText },
    { id: "transcricao", label: "Transcrição", icon: MessageSquare },
  ];

  const conceito =
    lesson.description?.trim() ||
    moduleDescription?.trim() ||
    "Nenhum conceito cadastrado para esta aula/módulo.";

  const saveProgress = useMutation({
    mutationFn: async (body: { videoProgress?: number; complete?: boolean }) => {
      const res = await fetch(`/api/aluno/lessons/${lesson.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar progresso");
      return data as { completed: boolean; videoProgress: number };
    },
    onSuccess: (data) => {
      if (data.completed) {
        setCompleted(true);
        setWatchedComplete(true);
        toast.success("Aula marcada como concluída");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const persist = saveProgress.mutate;

  const onWatchComplete = useCallback(() => {
    setWatchedComplete(true);
    if (lastSavedProgress.current < 100) {
      lastSavedProgress.current = 100;
      persist({ videoProgress: 100 });
    }
  }, [persist]);

  const onProgress = useCallback(
    (percent: number) => {
      // Persiste progresso a cada ~10% para o servidor validar a conclusão
      if (percent - lastSavedProgress.current >= 10 || percent >= 95) {
        lastSavedProgress.current = percent;
        persist({ videoProgress: percent });
      }
    },
    [persist]
  );

  const canMarkComplete =
    completed ||
    allowCompleteWithoutWatch ||
    watchedComplete ||
    !lesson.videoId;

  const markComplete = () => {
    if (completed || saveProgress.isPending) return;
    if (!canMarkComplete) {
      toast.error("Assista o vídeo até o final para marcar como concluído");
      return;
    }
    saveProgress.mutate({ videoProgress: 100, complete: true });
  };

  return (
    <div className="space-y-5">
      <Header
        title={lesson.title}
        subtitle={`${courseTitle}${subjectTitle ? ` · ${subjectTitle}` : ""}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/aluno/cursos/${cursoId}`}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            }
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-stretch">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-gray-800">
            {lesson.videoId ? (
              <YouTubePlayer
                videoId={lesson.videoId}
                title={lesson.title}
                onWatchComplete={onWatchComplete}
                onProgress={onProgress}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-900 text-sm text-gray-400">
                Vídeo ainda não disponível para esta aula.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={markComplete}
              disabled={!canMarkComplete || completed || saveProgress.isPending}
              className={cn(
                "w-full sm:w-auto",
                completed &&
                  "bg-green-600 hover:bg-green-600 disabled:opacity-100"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {completed
                ? "Aula concluída"
                : saveProgress.isPending
                  ? "Salvando..."
                  : "Marcar como concluído"}
            </Button>
            {!completed && lesson.videoId && !watchedComplete && (
              <p className="text-xs text-gray-500">
                Assista o vídeo até o final para habilitar este botão.
              </p>
            )}
          </div>
        </div>

        <aside className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:min-h-0">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors sm:text-sm",
                  tab === t.id
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-white/90"
                )}
              >
                <t.icon size={15} />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "conceito" && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Módulo
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                    {moduleTitle}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Conceito
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {conceito}
                  </p>
                </div>
              </div>
            )}

            {tab === "materiais" && (
              <div className="space-y-2">
                {materials.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum material anexado.</p>
                ) : (
                  materials.map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
                    >
                      <FileText size={18} className="shrink-0 text-brand-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                          {m.title}
                        </p>
                        <p className="text-xs uppercase text-gray-400">{m.type}</p>
                      </div>
                      <Download size={16} className="shrink-0 text-gray-400" />
                    </a>
                  ))
                )}
              </div>
            )}

            {tab === "transcricao" && (
              <div>
                {lesson.transcript?.trim() ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {lesson.transcript}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400">
                    Transcrição ainda não disponível para esta aula.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Professor IA
            </h3>
            <p className="text-xs text-gray-500">
              Tire dúvidas sobre esta aula e o material do curso
            </p>
          </div>
        </div>
        <div className="p-4">
          <TutorChat courseId={cursoId} compact />
        </div>
      </section>
    </div>
  );
}
