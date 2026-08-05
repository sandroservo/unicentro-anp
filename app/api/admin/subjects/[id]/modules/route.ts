import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { moduleCreateSchema } from "@/lib/validations/lesson";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/subjects/[id]/modules  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: subjectId } = await params;
    const modules = await prisma.module.findMany({
      where: { subjectId },
      select: { id: true, title: true, order: true, _count: { select: { lessons: true } } },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    });
    return NextResponse.json({ modules });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar módulos:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/subjects/[id]/modules  (lessons.write)
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id: subjectId } = await params;
    const data = await parseBody(moduleCreateSchema, request);

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) return apiError("Disciplina não encontrada", 404);

    const mod = await prisma.module.create({
      data: {
        courseId: subject.courseId,
        subjectId,
        title: data.title,
        description: data.description || null,
        order: data.order ?? 0,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: mod.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar módulo:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
