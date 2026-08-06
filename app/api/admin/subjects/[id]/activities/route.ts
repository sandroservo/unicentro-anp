import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { subjectActivityCreateSchema } from "@/lib/validations/activity";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/subjects/[id]/activities — atividades das aulas desta matéria
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: subjectId } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
    if (!subject) return apiError("Matéria não encontrada", 404);

    const activities = await prisma.activity.findMany({
      where: { lesson: { module: { subjectId } } },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        maxAttempts: true,
        aiGrading: true,
        dueDate: true,
        lessonId: true,
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true } },
          },
        },
        _count: { select: { activityQuestions: true, submissions: true } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar atividades da matéria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/subjects/[id]/activities — cria atividade vinculada a aula da matéria
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id: subjectId } = await params;
    const data = await parseBody(subjectActivityCreateSchema, request);

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        module: { subjectId },
      },
      select: { id: true },
    });
    if (!lesson) {
      return apiError(
        "Aula inválida: escolha uma aula que pertença a esta matéria",
        400
      );
    }

    const activity = await prisma.activity.create({
      data: {
        lessonId: lesson.id,
        title: data.title,
        description: data.description || null,
        type: "QUIZ",
        questions: "[]",
        maxAttempts: data.maxAttempts ?? 3,
        aiGrading: data.aiGrading ?? false,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      select: { id: true, lessonId: true },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar atividade da matéria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
