import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { subjectUpdateSchema } from "@/lib/validations/subject";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/subjects/[id]  (subjects.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("subjects.write");
    const { id } = await params;
    const data = await parseBody(subjectUpdateSchema, request);

    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return apiError("Disciplina não encontrada", 404);

    await prisma.subject.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.code !== undefined ? { code: data.code || null } : {}),
        ...(data.order !== undefined ? { order: data.order ?? 0 } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar disciplina:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/subjects/[id]  (subjects.write) — módulos ficam (subjectId->null)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("subjects.write");
    const { id } = await params;

    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return apiError("Disciplina não encontrada", 404);

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover disciplina:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
