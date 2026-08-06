import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

/** DELETE — remove vínculo aluno↔matéria */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.write");
    const { id } = await ctx.params;

    const enrollment = await prisma.subjectEnrollment.findUnique({ where: { id } });
    if (!enrollment) return apiError("Vínculo não encontrado", 404);

    await prisma.subjectEnrollment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover vínculo:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
