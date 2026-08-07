import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { getAISettings, setAISettings, type AISettings } from "@/lib/settings";
import { parseBody, apiError, ApiError } from "@/lib/api";

const ADMIN_ROLES = ["ADMIN", "SUPER"];

const settingsSchema = z.object({
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

function maskKey(key: string | null): string {
  if (!key || key.length < 8) return "";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

function toResponse(settings: {
  baseUrl: string | null;
  apiKey: string | null;
  model: string | null;
}) {
  return {
    baseUrl: settings.baseUrl ?? "",
    apiKey: settings.apiKey ? maskKey(settings.apiKey) : "",
    model: settings.model ?? "",
  };
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !ADMIN_ROLES.includes(role)) {
    return apiError("Não autorizado", 401);
  }

  return NextResponse.json(toResponse(await getAISettings()));
}

export async function PATCH(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !ADMIN_ROLES.includes(role)) {
    return apiError("Não autorizado", 401);
  }

  try {
    const body = await parseBody(settingsSchema, request);
    const updates: Partial<AISettings> = {};

    if (typeof body.baseUrl === "string")
      updates.baseUrl = body.baseUrl.trim() || null;
    // Só atualiza chave se for valor novo (não mascarado, ex: sk-a••••••••xyz)
    if (typeof body.apiKey === "string") {
      const v = body.apiKey.trim();
      if (v && !v.includes("•")) updates.apiKey = v;
      else if (v === "") updates.apiKey = null;
    }
    if (typeof body.model === "string")
      updates.model = body.model.trim() || null;

    await setAISettings(updates);
    return NextResponse.json(toResponse(await getAISettings()));
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao salvar settings:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
