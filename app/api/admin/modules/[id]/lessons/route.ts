import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { getYouTubeVideoId } from "@/lib/utils";
import { lessonCreateSchema } from "@/lib/validations/lesson";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/modules/[id]/lessons  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: moduleId } = await params;
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true, title: true, videoUrl: true, order: true },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    });
    return NextResponse.json({ lessons });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar aulas:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/modules/[id]/lessons  (lessons.write)
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id: moduleId } = await params;
    const data = await parseBody(lessonCreateSchema, request);

    const mod = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) return apiError("Módulo não encontrado", 404);

    const videoId = data.videoUrl ? getYouTubeVideoId(data.videoUrl) : null;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description || null,
        videoUrl: data.videoUrl || null,
        videoId,
        duration: data.duration ?? null,
        order: data.order ?? 0,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: lesson.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar aula:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
