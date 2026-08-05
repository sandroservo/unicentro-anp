import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { indexKnowledge } from "@/lib/knowledge";

const schema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  text: z.string().trim().min(1, "Texto é obrigatório"),
  courseId: z.string().optional().or(z.literal("")),
  lessonId: z.string().optional().or(z.literal("")),
  sourceType: z.string().optional(),
});

// POST /api/admin/knowledge  (lessons.write) — indexa texto na base de conhecimento
export async function POST(request: Request) {
  try {
    await requirePermission("lessons.write");
    const data = await parseBody(schema, request);
    const result = await indexKnowledge(
      {
        title: data.title,
        courseId: data.courseId || null,
        lessonId: data.lessonId || null,
        sourceType: data.sourceType,
      },
      data.text
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao indexar conhecimento:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
