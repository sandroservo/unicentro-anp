import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { activityUpdateSchema } from "@/lib/validations/activity";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/activities/[id]  (lessons.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const data = await parseBody(activityUpdateSchema, request);

    const act = await prisma.activity.findUnique({ where: { id } });
    if (!act) return apiError("Atividade não encontrada", 404);

    await prisma.activity.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.maxAttempts !== undefined ? { maxAttempts: data.maxAttempts ?? 3 } : {}),
        ...(data.aiGrading !== undefined ? { aiGrading: data.aiGrading } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/activities/[id]  (lessons.write)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const act = await prisma.activity.findUnique({ where: { id } });
    if (!act) return apiError("Atividade não encontrada", 404);
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover atividade:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
