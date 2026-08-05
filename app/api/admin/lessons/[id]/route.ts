import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { getYouTubeVideoId } from "@/lib/utils";
import { lessonUpdateSchema } from "@/lib/validations/lesson";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/lessons/[id]  (lessons.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const data = await parseBody(lessonUpdateSchema, request);

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return apiError("Aula não encontrada", 404);

    await prisma.lesson.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.videoUrl !== undefined
          ? { videoUrl: data.videoUrl || null, videoId: data.videoUrl ? getYouTubeVideoId(data.videoUrl) : null }
          : {}),
        ...(data.order !== undefined ? { order: data.order ?? 0 } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar aula:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/lessons/[id]  (lessons.write)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return apiError("Aula não encontrada", 404);
    await prisma.lesson.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover aula:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
