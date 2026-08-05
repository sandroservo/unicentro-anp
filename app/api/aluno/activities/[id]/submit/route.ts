import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { submitSchema } from "@/lib/validations/activity";
import { gradeObjective, type GradableQuestion } from "@/lib/grading";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/aluno/activities/[id]/submit — submete e auto-corrige objetivas  (sessão)
export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { id: activityId } = await params;
    const { answers } = await parseBody(submitSchema, request);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        maxAttempts: true,
        activityQuestions: {
          include: { question: { select: { id: true, type: true, options: true, points: true } } },
        },
      },
    });
    if (!activity) return apiError("Atividade não encontrada", 404);

    const priorAttempts = await prisma.submission.count({ where: { activityId, userId } });
    if (priorAttempts >= activity.maxAttempts) {
      return apiError("Número máximo de tentativas atingido", 409);
    }

    const questions: GradableQuestion[] = activity.activityQuestions.map((aq) => ({
      id: aq.question.id,
      type: aq.question.type,
      points: aq.question.points,
      options: aq.question.options ? JSON.parse(aq.question.options) : null,
    }));

    const { objectivePoints, hasEssay } = gradeObjective(questions, answers);

    const submission = await prisma.submission.create({
      data: {
        activityId,
        userId,
        answers: JSON.stringify(answers),
        aiGrade: objectivePoints,
        finalGrade: hasEssay ? null : objectivePoints,
        attempt: priorAttempts + 1,
      },
      select: { id: true, aiGrade: true, finalGrade: true },
    });

    return NextResponse.json(
      {
        id: submission.id,
        objectivePoints,
        pendingEssayGrading: hasEssay,
        finalGrade: submission.finalGrade,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao submeter atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
