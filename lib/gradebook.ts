export type GbActivity = { id: string; title: string };
export type GbSubmission = {
  userId: string;
  userName: string;
  activityId: string;
  finalGrade: number | null;
};

export type GradebookRow = {
  userId: string;
  name: string;
  grades: Record<string, number | null>; // activityId -> melhor nota
  average: number;
};

// Monta a matriz aluno × atividade (melhor tentativa) + média por aluno.
export function buildGradebook(activities: GbActivity[], submissions: GbSubmission[]) {
  const byUser = new Map<string, { name: string; grades: Record<string, number | null> }>();

  for (const s of submissions) {
    if (!byUser.has(s.userId)) byUser.set(s.userId, { name: s.userName, grades: {} });
    const row = byUser.get(s.userId)!;
    if (s.finalGrade == null) {
      if (!(s.activityId in row.grades)) row.grades[s.activityId] = null;
    } else {
      const cur = row.grades[s.activityId];
      row.grades[s.activityId] = cur == null ? s.finalGrade : Math.max(cur, s.finalGrade);
    }
  }

  const rows: GradebookRow[] = [...byUser.entries()].map(([userId, { name, grades }]) => {
    const graded = activities
      .map((a) => grades[a.id])
      .filter((g): g is number => typeof g === "number");
    const average = graded.length ? graded.reduce((a, b) => a + b, 0) / graded.length : 0;
    return { userId, name, grades, average: Math.round(average * 100) / 100 };
  });

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return { activities, rows };
}
