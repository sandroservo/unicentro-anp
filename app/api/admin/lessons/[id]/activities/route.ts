import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { activityCreateSchema } from "@/lib/validations/activity";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/lessons/[id]/activities  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: lessonId } = await params;
    const activities = await prisma.activity.findMany({
      where: { lessonId },
      select: {
        id: true, title: true, dueDate: true, aiGrading: true,
        _count: { select: { activityQuestions: true, submissions: true } },
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ activities });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar atividades:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/lessons/[id]/activities  (lessons.write)
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id: lessonId } = await params;
    const data = await parseBody(activityCreateSchema, request);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return apiError("Aula não encontrada", 404);

    const activity = await prisma.activity.create({
      data: {
        lessonId,
        title: data.title,
        description: data.description || null,
        type: "QUIZ",
        questions: "[]",
        maxAttempts: data.maxAttempts ?? 3,
        aiGrading: data.aiGrading ?? false,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: activity.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
