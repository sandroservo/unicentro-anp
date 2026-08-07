"use client";

import { useMemo, useState } from "react";
import {
  BookMarked,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { TutorChat } from "@/components/tutor/tutor-chat";

type CourseOpt = { id: string; title: string };

const TIPS = [
  {
    icon: MessageSquareText,
    title: "Pergunte com contexto",
    text: "Cite o tema ou a aula — a resposta fica mais precisa.",
  },
  {
    icon: BookMarked,
    title: "Baseado no material",
    text: "O tutor prioriza o conteúdo indexado da sua turma.",
  },
  {
    icon: Lightbulb,
    title: "Peça exemplos",
    text: "Solicite exercícios, resumos ou analogias práticas.",
  },
];

export function TutorPageClient({ courses }: { courses: CourseOpt[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const selected = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId]
  );

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-transparent dark:from-brand-500/10 dark:via-transparent dark:to-transparent"
        />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/70 bg-brand-50/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <GraduationCap size={12} />
              Tutoria acadêmica
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/95 sm:text-2xl">
              Seu apoio didático, a qualquer hora
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Tire dúvidas, peça resumos e pratique com um tutor alinhado à
              ementa e ao material da turma.
            </p>
          </div>

          {courses.length > 0 ? (
            <label className="block w-full max-w-sm space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Turma ativa
              </span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950/50 dark:text-white/90"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </section>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-medium">Nenhuma turma vinculada</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
            Peça ao administrador para matricular você. O Professor IA usa o
            material da turma para responder com precisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <TutorChat
            courseId={courseId || undefined}
            courseTitle={selected?.title}
          />

          <aside className="space-y-3 lg:pt-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                <ShieldCheck size={16} className="text-brand-500" />
                Como usar bem
              </div>
              <ul className="space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                      <tip.icon size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {tip.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {tip.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-xs leading-relaxed text-gray-500 dark:border-gray-800 dark:text-gray-400">
              O tutor complementa as aulas e o professor da disciplina — não
              substitui avaliações oficiais.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
