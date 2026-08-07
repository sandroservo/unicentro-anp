import { NextResponse } from "next/server";
import { z } from "zod";
import { getAISettings, setAISettings, type AISettings } from "@/lib/settings";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/rbac";

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

async function requireSettingsAccess() {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Não autorizado");
  const canManage =
    isAdminRole(session.user.role) ||
    session.user.permissions?.includes("settings.manage");
  if (!canManage) throw new ApiError(403, "Acesso negado");
  return session;
}

export async function GET() {
  try {
    await requireSettingsAccess();
    return NextResponse.json(toResponse(await getAISettings()));
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao carregar settings:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSettingsAccess();
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
