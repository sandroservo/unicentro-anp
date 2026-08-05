import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { gradeManualSchema } from "@/lib/validations/activity";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/submissions/[id]  (lessons.write) — nota/feedback manual
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const data = await parseBody(gradeManualSchema, request);

    const sub = await prisma.submission.findUnique({ where: { id } });
    if (!sub) return apiError("Submissão não encontrada", 404);

    await prisma.submission.update({
      where: { id },
      data: { finalGrade: data.finalGrade, aiFeedback: data.feedback || sub.aiFeedback },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao corrigir manualmente:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
