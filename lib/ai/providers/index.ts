// lib/ai/providers/index.ts
// Suporte a múltiplos provedores de IA; configuração via painel admin (banco) ou .env
import type { AISettings } from "@/lib/settings";
import type { AIMessage } from "../professor-virtual";
import { callAnthropic } from "./anthropic";
import { callOpenAI } from "./openai";

export type AIProviderType = "anthropic" | "openai";

export interface ActiveProvider {
  provider: AIProviderType;
  apiKey: string;
  anthropicModel?: string | null;
  openaiModel?: string | null;
}

function getFromEnv(): ActiveProvider | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (provider === "anthropic" && anthropicKey)
    return { provider: "anthropic", apiKey: anthropicKey };
  if (provider === "openai" && openaiKey)
    return { provider: "openai", apiKey: openaiKey };
  if (anthropicKey) return { provider: "anthropic", apiKey: anthropicKey };
  if (openaiKey) return { provider: "openai", apiKey: openaiKey };
  return null;
}

/**
 * Retorna o provedor ativo: primeiro usa settings do banco; se vazio, usa .env.
 */
export function getActiveProvider(settings?: AISettings | null): ActiveProvider | null {
  if (settings) {
    const { provider, anthropicApiKey, openaiApiKey, anthropicModel, openaiModel } = settings;
    if (provider === "anthropic" && anthropicApiKey)
      return { provider: "anthropic", apiKey: anthropicApiKey, anthropicModel, openaiModel };
    if (provider === "openai" && openaiApiKey)
      return { provider: "openai", apiKey: openaiApiKey, anthropicModel, openaiModel };
    if (anthropicApiKey)
      return { provider: "anthropic", apiKey: anthropicApiKey, anthropicModel, openaiModel };
    if (openaiApiKey)
      return { provider: "openai", apiKey: openaiApiKey, anthropicModel, openaiModel };
  }
  return getFromEnv();
}

/**
 * Chama a API do provedor configurado. settings vindo do banco (painel admin); se null, usa .env.
 */
export async function callChatAPI(
  messages: AIMessage[],
  systemPrompt: string,
  settings?: AISettings | null
): Promise<string> {
  const active = getActiveProvider(settings);
  if (!active) {
    throw new Error("Nenhum provedor de IA configurado. Configure em Admin → Configurações.");
  }

  switch (active.provider) {
    case "anthropic":
      return callAnthropic(
        messages,
        systemPrompt,
        active.apiKey,
        active.anthropicModel || undefined
      );
    case "openai":
      return callOpenAI(
        messages,
        systemPrompt,
        active.apiKey,
        active.openaiModel || undefined
      );
    default:
      throw new Error(`Provedor não suportado: ${active.provider}`);
  }
}

export { callAnthropic } from "./anthropic";
export { callOpenAI } from "./openai";
