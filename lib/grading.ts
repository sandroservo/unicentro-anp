export type Option = { text: string; correct: boolean };

export type GradableQuestion = {
  id: string;
  type: string; // MULTIPLE_CHOICE | TRUE_FALSE | ESSAY
  points: number;
  options: Option[] | null;
};

export type AnswerMap = Record<string, unknown>; // questionId -> resposta

// Corrige as questões objetivas (MC/TF). Resposta esperada: array de índices selecionados.
// Retorna pontos obtidos, máximo objetivo e se há dissertativa pendente.
export function gradeObjective(questions: GradableQuestion[], answers: AnswerMap) {
  let objectivePoints = 0;
  let objectiveMax = 0;
  let hasEssay = false;

  for (const q of questions) {
    if (q.type === "ESSAY") {
      hasEssay = true;
      continue;
    }
    objectiveMax += q.points;
    const correctIdx = (q.options ?? [])
      .map((o, i) => (o.correct ? i : -1))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    const raw = answers[q.id];
    const given = Array.isArray(raw)
      ? (raw as unknown[]).map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b)
      : [];
    const equal =
      correctIdx.length > 0 &&
      given.length === correctIdx.length &&
      given.every((v, i) => v === correctIdx[i]);
    if (equal) objectivePoints += q.points;
  }

  return { objectivePoints, objectiveMax, hasEssay };
}
