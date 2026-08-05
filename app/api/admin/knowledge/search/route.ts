import { NextResponse } from "next/server";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { searchKnowledge } from "@/lib/knowledge";

// GET /api/admin/knowledge/search?q=&courseId=&k=  (courses.read)
export async function GET(request: Request) {
  try {
    await requirePermission("courses.read");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const courseId = searchParams.get("courseId")?.trim() || null;
    const k = Math.min(20, Math.max(1, Number(searchParams.get("k")) || 5));
    if (!q) return apiError("Parâmetro q é obrigatório", 400);

    const hits = await searchKnowledge(q, k, { courseId });
    return NextResponse.json({ hits });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro na busca:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
