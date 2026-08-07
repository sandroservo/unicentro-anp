import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

// GET /api/admin/notifications — conclusões recentes de aulas pelos alunos (students.read)
// ponytail: usa Progress.lastAccess como "concluído em" (não há completedAt); reordena se a aula for reacessada. Basta para o feed.
export async function GET() {
  try {
    await requirePermission("students.read");

    const rows = await prisma.progress.findMany({
      where: { completed: true },
      orderBy: { lastAccess: "desc" },
      take: 20,
      select: {
        id: true,
        lastAccess: true,
        user: { select: { name: true } },
        lesson: {
          select: {
            title: true,
            module: { select: { course: { select: { title: true } } } },
          },
        },
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      studentName: r.user.name,
      lessonTitle: r.lesson.title,
      courseTitle: r.lesson.module.course.title,
      at: r.lastAccess.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar notificações:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
