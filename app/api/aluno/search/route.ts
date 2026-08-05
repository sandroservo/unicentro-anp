import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { searchKnowledge } from "@/lib/knowledge";

// GET /api/aluno/search?q=&courseId=  (sessão) — busca semântica no material
export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const courseId = searchParams.get("courseId")?.trim() || null;
    if (!q) return apiError("Parâmetro q é obrigatório", 400);

    const hits = await searchKnowledge(q, 10, { courseId });

    // Enriquece com o título da KnowledgeBase.
    const kbIds = [...new Set(hits.map((h) => h.knowledgeBaseId))];
    const kbs = kbIds.length
      ? await prisma.knowledgeBase.findMany({
          where: { id: { in: kbIds } },
          select: { id: true, title: true, lessonId: true },
        })
      : [];
    const byId = new Map(kbs.map((k) => [k.id, k]));

    return NextResponse.json({
      results: hits.map((h) => ({
        content: h.content,
        score: h.score,
        source: byId.get(h.knowledgeBaseId)?.title ?? "Material",
        lessonId: byId.get(h.knowledgeBaseId)?.lessonId ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro na busca semântica:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
