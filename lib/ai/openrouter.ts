import { getSetting } from "@/lib/settings";

// Motor do Professor IA. OmniRoute (gateway self-hosted, OpenAI-compatible) é o
// alvo padrão quando OMNIROUTE_* está setado; senão cai no OpenRouter público.
// ponytail: OmniRoute fala o mesmo wire OpenAI — só troca base URL/key/model, sem SDK novo.
export async function getApiKey(): Promise<string | null> {
  return (
    (await getSetting("ai_base_key")) ||
    process.env.OMNIROUTE_API_KEY ||
    (await getSetting("openrouter_api_key")) ||
    process.env.OPENROUTER_API_KEY ||
    null
  );
}

async function getBaseUrl(): Promise<string> {
  const url =
    (await getSetting("ai_base_url")) ||
    process.env.OMNIROUTE_BASE_URL ||
    process.env.OPENROUTER_BASE_URL ||
    "https://openrouter.ai/api/v1";
  return url.replace(/\/+$/, "");
}

async function getModel(): Promise<string> {
  const configured =
    (await getSetting("ai_model")) ||
    (await getSetting("openrouter_model")) ||
    process.env.OMNIROUTE_MODEL ||
    process.env.OPENROUTER_MODEL;
  if (configured) return configured;
  // Sem model explícito: se a base NÃO é o OpenRouter público, assume OmniRoute e usa
  // "auto" (roteia pelos provedores grátis primeiro, conforme a estratégia do dashboard).
  const baseUrl = await getBaseUrl();
  return baseUrl.includes("openrouter.ai") ? "openai/gpt-4o-mini" : "auto";
}

// Extrai o primeiro bloco JSON { ... } de um texto (tolera ruído/markdown).
export function extractGradeJson(text: string): { points: number; feedback: string } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (typeof obj.points !== "number") return null;
    return { points: obj.points, feedback: String(obj.feedback ?? "") };
  } catch {
    return null;
  }
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Chat completion via OpenRouter. Lança Error("NO_API_KEY") sem chave.
export async function chatCompletion(messages: ChatMessage[], temperature = 0.3): Promise<string> {
  const key = await getApiKey();
  if (!key) throw new Error("NO_API_KEY");
  const model = await getModel();
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Prompt único (compat). Lança Error("NO_API_KEY") sem chave.
async function callOpenRouter(prompt: string): Promise<string> {
  return chatCompletion([{ role: "user", content: prompt }], 0.2);
}

// Corrige uma dissertativa. Retorna pontos (0..maxPoints) e feedback.
export async function gradeEssayWithAI(
  question: string,
  answer: string,
  rubric: string,
  maxPoints: number
): Promise<{ points: number; feedback: string }> {
  const prompt = `Você é um corretor. Avalie a resposta dissertativa e responda APENAS com um JSON no formato {"points": number, "feedback": string}.

QUESTÃO: ${question}
RESPOSTA DO ALUNO: ${answer}
RUBRICA/GABARITO: ${rubric || "(sem rubrica; avalie pela pertinência e correção)"}
PONTUAÇÃO MÁXIMA: ${maxPoints}

points deve ser um número entre 0 e ${maxPoints}. feedback deve ser construtivo e em português.`;

  const raw = await callOpenRouter(prompt);
  const parsed = extractGradeJson(raw);
  if (!parsed) return { points: 0, feedback: "Não foi possível interpretar a correção da IA." };
  const points = Math.max(0, Math.min(maxPoints, parsed.points));
  return { points, feedback: parsed.feedback };
}
