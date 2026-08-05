import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/question-categories/[id]  (questions.write) — questões ficam (categoryId->null)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("questions.write");
    const { id } = await params;
    const cat = await prisma.questionCategory.findUnique({ where: { id } });
    if (!cat) return apiError("Categoria não encontrada", 404);
    await prisma.questionCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover categoria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
