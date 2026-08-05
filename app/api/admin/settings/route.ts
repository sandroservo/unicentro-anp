import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getAISettings, setAISettings, type AISettings } from "@/lib/settings";
import { parseBody, apiError, ApiError } from "@/lib/api";

const ADMIN_ROLES = ["ADMIN", "SUPER"];

const settingsSchema = z.object({
  provider: z.enum(["anthropic", "openai"]).nullable().optional(),
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  anthropicModel: z.string().optional(),
  openaiModel: z.string().optional(),
});

function maskKey(key: string | null): string {
  if (!key || key.length < 8) return "";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || !role || !ADMIN_ROLES.includes(role)) {
    return apiError("Não autorizado", 401);
  }

  const settings = await getAISettings();
  return NextResponse.json({
    provider: settings.provider,
    anthropicApiKey: settings.anthropicApiKey ? maskKey(settings.anthropicApiKey) : "",
    openaiApiKey: settings.openaiApiKey ? maskKey(settings.openaiApiKey) : "",
    anthropicModel: settings.anthropicModel ?? "",
    openaiModel: settings.openaiModel ?? "",
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || !role || !ADMIN_ROLES.includes(role)) {
    return apiError("Não autorizado", 401);
  }

  try {
    const body = await parseBody(settingsSchema, request);
    const updates: Partial<AISettings> = {};

    if (body.provider !== undefined)
      updates.provider = body.provider === "anthropic" || body.provider === "openai" ? body.provider : null;
    // Só atualiza chave se for valor novo (não mascarado, ex: sk-ant-••••••••xyz)
    if (typeof body.anthropicApiKey === "string") {
      const v = body.anthropicApiKey.trim();
      if (v && !v.includes("•")) updates.anthropicApiKey = v;
      else if (v === "") updates.anthropicApiKey = null;
    }
    if (typeof body.openaiApiKey === "string") {
      const v = body.openaiApiKey.trim();
      if (v && !v.includes("•")) updates.openaiApiKey = v;
      else if (v === "") updates.openaiApiKey = null;
    }
    if (typeof body.anthropicModel === "string")
      updates.anthropicModel = body.anthropicModel.trim() || null;
    if (typeof body.openaiModel === "string")
      updates.openaiModel = body.openaiModel.trim() || null;

    await setAISettings(updates);
    const settings = await getAISettings();
    return NextResponse.json({
      provider: settings.provider,
      anthropicApiKey: settings.anthropicApiKey ? maskKey(settings.anthropicApiKey) : "",
      openaiApiKey: settings.openaiApiKey ? maskKey(settings.openaiApiKey) : "",
      anthropicModel: settings.anthropicModel ?? "",
      openaiModel: settings.openaiModel ?? "",
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao salvar settings:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
