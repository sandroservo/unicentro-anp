import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { setQuestionsSchema } from "@/lib/validations/activity";

type Ctx = { params: Promise<{ id: string }> };

// GET — questões vinculadas (ordem)  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id } = await params;
    const links = await prisma.activityQuestion.findMany({
      where: { activityId: id },
      include: { question: { select: { id: true, statement: true, type: true, points: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ questions: links.map((l) => l.question) });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar questões da atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// PUT — define o conjunto de questões (substitui)  (lessons.write)
export async function PUT(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const { questionIds } = await parseBody(setQuestionsSchema, request);

    const act = await prisma.activity.findUnique({ where: { id } });
    if (!act) return apiError("Atividade não encontrada", 404);

    await prisma.$transaction([
      prisma.activityQuestion.deleteMany({ where: { activityId: id } }),
      ...(questionIds.length
        ? [
            prisma.activityQuestion.createMany({
              data: questionIds.map((qid, i) => ({ activityId: id, questionId: qid, order: i })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true, count: questionIds.length });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao definir questões:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
