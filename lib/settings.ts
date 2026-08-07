// lib/settings.ts - Configurações do sistema (banco de dados)
import type { PrismaClient } from "../generated/prisma/client";

export const SETTING_KEYS = {
  // Motor do Professor IA: gateway OmniRoute (OpenAI-compatible). Chaves lidas em lib/ai/openrouter.ts.
  AI_BASE_URL: "ai_base_url",
  AI_BASE_KEY: "ai_base_key",
  AI_MODEL: "ai_model",
  YOUTUBE_API_KEY: "youtube_api_key",
} as const;

export type AISettings = {
  baseUrl: string | null;
  apiKey: string | null;
  model: string | null;
};

async function getDb(): Promise<PrismaClient> {
  const { prisma } = await import("./prisma");
  return prisma;
}

export async function getSetting(key: string): Promise<string | null> {
  const prisma = await getDb();
  const row = await prisma.systemSetting.findUnique({
    where: { key },
  });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const prisma = await getDb();
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getAISettings(): Promise<AISettings> {
  const [baseUrl, apiKey, model] = await Promise.all([
    getSetting(SETTING_KEYS.AI_BASE_URL),
    getSetting(SETTING_KEYS.AI_BASE_KEY),
    getSetting(SETTING_KEYS.AI_MODEL),
  ]);

  return {
    baseUrl: baseUrl?.trim() || null,
    apiKey: apiKey?.trim() || null,
    model: model?.trim() || null,
  };
}

export async function setAISettings(settings: Partial<AISettings>): Promise<void> {
  const map: Array<[keyof AISettings, string]> = [
    ["baseUrl", SETTING_KEYS.AI_BASE_URL],
    ["apiKey", SETTING_KEYS.AI_BASE_KEY],
    ["model", SETTING_KEYS.AI_MODEL],
  ];
  for (const [field, key] of map) {
    if (settings[field] !== undefined) {
      await setSetting(key, settings[field] || "");
    }
  }
}
