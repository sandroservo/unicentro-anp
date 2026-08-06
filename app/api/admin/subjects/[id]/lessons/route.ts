import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/subjects/[id]/lessons — aulas da matéria (para vincular atividade)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: subjectId } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
    if (!subject) return apiError("Matéria não encontrada", 404);

    const lessons = await prisma.lesson.findMany({
      where: { module: { subjectId } },
      select: {
        id: true,
        title: true,
        order: true,
        module: { select: { id: true, title: true, order: true } },
      },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({
      lessons: lessons.map((l) => ({
        id: l.id,
        title: l.title,
        moduleTitle: l.module.title,
        label: `${l.module.title} · ${l.title}`,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar aulas da matéria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
