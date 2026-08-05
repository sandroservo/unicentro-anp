import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { moduleUpdateSchema } from "@/lib/validations/lesson";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/modules/[id]  (lessons.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const data = await parseBody(moduleUpdateSchema, request);

    const mod = await prisma.module.findUnique({ where: { id } });
    if (!mod) return apiError("Módulo não encontrado", 404);

    await prisma.module.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.order !== undefined ? { order: data.order ?? 0 } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar módulo:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/modules/[id]  (lessons.write) — remove módulo + aulas (cascade)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const mod = await prisma.module.findUnique({ where: { id } });
    if (!mod) return apiError("Módulo não encontrado", 404);
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover módulo:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
