// lib/settings.ts - Configurações do sistema (banco de dados)
import type { PrismaClient } from "../generated/prisma/client";

export const SETTING_KEYS = {
  AI_PROVIDER: "ai_provider",
  ANTHROPIC_API_KEY: "anthropic_api_key",
  OPENAI_API_KEY: "openai_api_key",
  AI_ANTHROPIC_MODEL: "ai_anthropic_model",
  AI_OPENAI_MODEL: "ai_openai_model",
  YOUTUBE_API_KEY: "youtube_api_key",
} as const;

export type AISettings = {
  provider: "anthropic" | "openai" | null;
  anthropicApiKey: string | null;
  openaiApiKey: string | null;
  anthropicModel: string | null;
  openaiModel: string | null;
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
  const [provider, anthropicKey, openaiKey, anthropicModel, openaiModel] =
    await Promise.all([
      getSetting(SETTING_KEYS.AI_PROVIDER),
      getSetting(SETTING_KEYS.ANTHROPIC_API_KEY),
      getSetting(SETTING_KEYS.OPENAI_API_KEY),
      getSetting(SETTING_KEYS.AI_ANTHROPIC_MODEL),
      getSetting(SETTING_KEYS.AI_OPENAI_MODEL),
    ]);

  return {
    provider: (provider === "anthropic" || provider === "openai" ? provider : null) ?? null,
    anthropicApiKey: anthropicKey?.trim() || null,
    openaiApiKey: openaiKey?.trim() || null,
    anthropicModel: anthropicModel?.trim() || null,
    openaiModel: openaiModel?.trim() || null,
  };
}

export async function setAISettings(settings: Partial<AISettings>): Promise<void> {
  const updates: Array<{ key: string; value: string }> = [];
  if (settings.provider !== undefined)
    updates.push({ key: SETTING_KEYS.AI_PROVIDER, value: settings.provider || "" });
  if (settings.anthropicApiKey !== undefined)
    updates.push({ key: SETTING_KEYS.ANTHROPIC_API_KEY, value: settings.anthropicApiKey || "" });
  if (settings.openaiApiKey !== undefined)
    updates.push({ key: SETTING_KEYS.OPENAI_API_KEY, value: settings.openaiApiKey || "" });
  if (settings.anthropicModel !== undefined)
    updates.push({ key: SETTING_KEYS.AI_ANTHROPIC_MODEL, value: settings.anthropicModel || "" });
  if (settings.openaiModel !== undefined)
    updates.push({ key: SETTING_KEYS.AI_OPENAI_MODEL, value: settings.openaiModel || "" });

  for (const { key, value } of updates) {
    await setSetting(key, value);
  }
}
