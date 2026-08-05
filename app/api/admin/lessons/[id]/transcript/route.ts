import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { fetchYouTubeTranscript } from "@/lib/transcript";
import { indexKnowledge } from "@/lib/knowledge";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ text: z.string().trim().optional().or(z.literal("")) });

// POST /api/admin/lessons/[id]/transcript  (lessons.write)
// Body { text? }: usa o texto se vier, senão busca legendas do YouTube.
// Salva Lesson.transcript e indexa na KnowledgeBase.
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("lessons.write");
    const { id } = await params;
    const { text } = await parseBody(schema, request);

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { id: true, title: true, videoId: true, module: { select: { courseId: true } } },
    });
    if (!lesson) return apiError("Aula não encontrada", 404);

    let transcript = text?.trim() || null;
    if (!transcript) {
      if (!lesson.videoId) return apiError("Aula sem vídeo do YouTube", 422);
      transcript = await fetchYouTubeTranscript(lesson.videoId);
      if (!transcript) return apiError("Legendas indisponíveis para este vídeo", 422);
    }

    await prisma.lesson.update({ where: { id }, data: { transcript } });

    const indexed = await indexKnowledge(
      {
        title: `Transcrição: ${lesson.title}`,
        courseId: lesson.module.courseId,
        lessonId: lesson.id,
        sourceType: "transcript",
      },
      transcript
    );

    return NextResponse.json(
      { transcriptLength: transcript.length, ...indexed },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro na transcrição:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
