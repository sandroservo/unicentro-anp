import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { courseUpdateSchema } from "@/lib/validations/course";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/courses/[id]  (courses.write) — slug não muda (estável)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.write");
    const { id } = await params;
    const data = await parseBody(courseUpdateSchema, request);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return apiError("Curso não encontrado", 404);

    await prisma.course.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.code !== undefined ? { code: data.code || null } : {}),
        ...(data.workloadHours !== undefined ? { workloadHours: data.workloadHours ?? null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.aiPersona !== undefined ? { aiPersona: data.aiPersona || null } : {}),
        ...(data.aiContext !== undefined ? { aiContext: data.aiContext || null } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar curso:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/courses/[id]  (courses.write) — inativa (soft)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.write");
    const { id } = await params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return apiError("Curso não encontrado", 404);

    await prisma.course.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao inativar curso:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
