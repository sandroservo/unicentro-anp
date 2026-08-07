import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { gradeEssayWithAI } from "@/lib/ai/openrouter";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/submissions/[id]/grade-ai  (lessons.write) — corrige dissertativas via OmniRoute
export async function POST(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;

    const sub = await prisma.submission.findUnique({
      where: { id },
      select: {
        id: true, answers: true, aiGrade: true,
        activity: {
          select: {
            activityQuestions: {
              include: { question: { select: { id: true, type: true, statement: true, answerKey: true, points: true } } },
            },
          },
        },
      },
    });
    if (!sub) return apiError("Submissão não encontrada", 404);

    const answers = JSON.parse(sub.answers) as Record<string, unknown>;
    const essays = sub.activity.activityQuestions
      .map((aq) => aq.question)
      .filter((q) => q.type === "ESSAY");

    if (essays.length === 0) {
      return apiError("Atividade não tem questões dissertativas", 400);
    }

    let essayPoints = 0;
    const feedbacks: string[] = [];
    for (const q of essays) {
      const answer = String(answers[q.id] ?? "");
      const { points, feedback } = await gradeEssayWithAI(q.statement, answer, q.answerKey ?? "", q.points);
      essayPoints += points;
      feedbacks.push(`• ${q.statement}: ${points}/${q.points} — ${feedback}`);
    }

    const objective = sub.aiGrade ?? 0;
    const finalGrade = objective + essayPoints;

    await prisma.submission.update({
      where: { id },
      data: { finalGrade, aiFeedback: feedbacks.join("\n") },
    });

    return NextResponse.json({ finalGrade, essayPoints, objective });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    if (error instanceof Error && error.message === "NO_API_KEY") {
      return apiError(
        "Gateway de IA não configurado (OmniRoute / OMNIROUTE_API_KEY)",
        503
      );
    }
    console.error("Erro na correção IA:", error);
    return apiError("Erro ao corrigir com IA", 502);
  }
}
