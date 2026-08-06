import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

/** DELETE — remove matrícula da turma (e vínculos de matérias desse curso) */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.write");
    const { id } = await ctx.params;

    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) return apiError("Matrícula não encontrada", 404);

    await prisma.$transaction([
      prisma.subjectEnrollment.deleteMany({
        where: {
          userId: enrollment.userId,
          subject: { courseId: enrollment.courseId },
        },
      }),
      prisma.enrollment.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover matrícula:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
