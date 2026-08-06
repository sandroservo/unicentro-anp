import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import {
  assertLessonAccess,
  canPreviewStudentView,
} from "@/lib/enrollment-access";

type Ctx = { params: Promise<{ lessonId: string }> };

const schema = z.object({
  videoProgress: z.number().min(0).max(100).optional(),
  complete: z.boolean().optional(),
});

async function refreshCourseProgress(userId: string, courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  if (lessons.length === 0) return;

  const done = await prisma.progress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });

  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: { progress: (done / lessons.length) * 100 },
  });
}

// PATCH /api/aluno/lessons/[lessonId]/progress
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const { lessonId } = await params;
    const body = await parseBody(schema, request);

    await assertLessonAccess(userId, lessonId, session.user.role);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, videoId: true, module: { select: { courseId: true } } },
    });
    if (!lesson) return apiError("Aula não encontrada", 404);

    const existing = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const nextProgress = Math.max(
      existing?.videoProgress ?? 0,
      body.videoProgress ?? 0
    );

    if (body.complete) {
      const isPreview = canPreviewStudentView(session.user.role);
      const hasVideo = Boolean(lesson.videoId);
      const watchedEnough = nextProgress >= 95 || existing?.completed;

      // Sem vídeo, ou admin em preview: pode concluir sem assistir
      if (hasVideo && !isPreview && !watchedEnough) {
        return apiError(
          "Assista o vídeo até o final para marcar como concluído",
          422
        );
      }
    }

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        videoProgress: body.complete ? 100 : nextProgress,
        completed: Boolean(body.complete),
        lastAccess: new Date(),
      },
      update: {
        videoProgress: body.complete
          ? 100
          : nextProgress,
        ...(body.complete ? { completed: true } : {}),
        lastAccess: new Date(),
      },
    });

    if (progress.completed && !canPreviewStudentView(session.user.role)) {
      await refreshCourseProgress(userId, lesson.module.courseId);
    }

    return NextResponse.json({
      completed: progress.completed,
      videoProgress: progress.videoProgress,
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao atualizar progresso:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// GET /api/aluno/lessons/[lessonId]/progress
export async function GET(_request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const { lessonId } = await params;

    await assertLessonAccess(userId, lessonId, session.user.role);

    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { completed: true, videoProgress: true },
    });

    return NextResponse.json({
      completed: progress?.completed ?? false,
      videoProgress: progress?.videoProgress ?? 0,
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    return apiError("Erro interno do servidor", 500);
  }
}
