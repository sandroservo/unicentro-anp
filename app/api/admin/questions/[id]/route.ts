import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { questionUpdateSchema } from "@/lib/validations/question";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/questions/[id]  (questions.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("questions.write");
    const { id } = await params;
    const data = await parseBody(questionUpdateSchema, request);

    const q = await prisma.question.findUnique({ where: { id } });
    if (!q) return apiError("Questão não encontrada", 404);

    await prisma.question.update({
      where: { id },
      data: {
        type: data.type,
        statement: data.statement,
        options: data.options ? JSON.stringify(data.options) : null,
        answerKey: data.answerKey || null,
        points: data.points ?? 1,
        categoryId: data.categoryId || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar questão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/questions/[id]  (questions.write)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("questions.write");
    const { id } = await params;
    const q = await prisma.question.findUnique({ where: { id } });
    if (!q) return apiError("Questão não encontrada", 404);
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover questão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
