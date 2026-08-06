import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { assertLessonAccess } from "@/lib/enrollment-access";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/aluno/activities/[id] — atividade + questões SEM gabarito  (sessão)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        maxAttempts: true,
        dueDate: true,
        lessonId: true,
        activityQuestions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                type: true,
                statement: true,
                options: true,
                points: true,
              },
            },
          },
        },
      },
    });
    if (!activity) return apiError("Atividade não encontrada", 404);

    await assertLessonAccess(session.user.id!, activity.lessonId, session.user.role);

    const questions = activity.activityQuestions.map((aq) => {
      const q = aq.question;
      const parsed = q.options ? (JSON.parse(q.options) as { text: string; correct: boolean }[]) : null;
      return {
        id: q.id,
        type: q.type,
        statement: q.statement,
        points: q.points,
        // Remove o campo `correct` — aluno não vê o gabarito.
        options: parsed ? parsed.map((o) => ({ text: o.text })) : null,
      };
    });

    return NextResponse.json({
      activity: { id: activity.id, title: activity.title, description: activity.description, dueDate: activity.dueDate },
      questions,
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao carregar atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
