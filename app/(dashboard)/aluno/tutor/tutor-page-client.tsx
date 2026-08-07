"use client";

import { useState } from "react";
import { TutorChat } from "@/components/tutor/tutor-chat";

type CourseOpt = { id: string; title: string };

export function TutorPageClient({ courses }: { courses: CourseOpt[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");

  return (
    <div className="space-y-4">
      {courses.length > 0 ? (
        <label className="block max-w-md space-y-1 text-sm">
          <span className="font-medium text-foreground">Turma</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300">
          Você ainda não está matriculado em nenhuma turma. Peça ao administrador
          para liberar o acesso — o Professor IA usa o material da turma.
        </p>
      )}
      <TutorChat courseId={courseId || undefined} />
    </div>
  );
}
