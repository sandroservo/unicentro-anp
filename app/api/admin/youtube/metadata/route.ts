import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { getYouTubeVideoId } from "@/lib/utils";
import { fetchVideoMetadata } from "@/lib/youtube";

const schema = z.object({ url: z.string().min(1, "URL é obrigatória") });

// POST /api/admin/youtube/metadata  (lessons.write) — busca metadados do vídeo
export async function POST(request: Request) {
  try {
    await requirePermission("lessons.write");
    const { url } = await parseBody(schema, request);

    const videoId = getYouTubeVideoId(url);
    if (!videoId) return apiError("URL do YouTube inválida", 400);

    const meta = await fetchVideoMetadata(videoId);
    if (!meta) return apiError("Vídeo não encontrado", 404);

    return NextResponse.json(meta);
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    if (error instanceof Error && error.message === "NO_API_KEY") {
      return apiError("YOUTUBE_API_KEY não configurada", 503);
    }
    console.error("Erro ao buscar metadados YouTube:", error);
    return apiError("Erro ao consultar o YouTube", 502);
  }
}
