import { getSetting } from "@/lib/settings";

// Motor do Professor IA via gateway OpenAI-compatible.
// Preferência: OmniRoute (self-hosted) → OpenRouter público.
// ponytail: mesmo wire OpenAI — só troca base URL/key/model.

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
  const baseUrl = await getBaseUrl();
  return baseUrl.includes("openrouter.ai") ? "openai/gpt-4o-mini" : "auto";
}

function isOpenRouterPublic(baseUrl: string): boolean {
  return baseUrl.includes("openrouter.ai");
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

async function resolveGateway(): Promise<{
  key: string | null;
  model: string;
  baseUrl: string;
}> {
  const key = await getApiKey();
  const baseUrl = await getBaseUrl();
  const model = await getModel();
  // OpenRouter público exige chave; OmniRoute pode rodar com REQUIRE_API_KEY=false.
  if (!key && isOpenRouterPublic(baseUrl)) throw new Error("NO_API_KEY");
  return { key, model, baseUrl };
}

function buildHeaders(key: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

// Chat completion (não-stream). Lança Error("NO_API_KEY") sem chave no OpenRouter.
export async function chatCompletion(
  messages: ChatMessage[],
  temperature = 0.3
): Promise<string> {
  const { key, model, baseUrl } = await resolveGateway();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(key),
    body: JSON.stringify({ model, messages, temperature, stream: false }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Stream SSE do gateway; yielda deltas de texto. */
export async function* chatCompletionStream(
  messages: ChatMessage[],
  temperature = 0.3
): AsyncGenerator<string, void, unknown> {
  const { key, model, baseUrl } = await resolveGateway();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(key),
    body: JSON.stringify({ model, messages, temperature, stream: true }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}`);
  if (!res.body) throw new Error("AI gateway sem corpo de stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.message?.content ??
          "";
        if (delta) yield String(delta);
      } catch {
        // ignora chunks malformados
      }
    }
  }
}

// Prompt único (compat).
async function callGateway(prompt: string): Promise<string> {
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

  const raw = await callGateway(prompt);
  const parsed = extractGradeJson(raw);
  if (!parsed) return { points: 0, feedback: "Não foi possível interpretar a correção da IA." };
  const points = Math.max(0, Math.min(maxPoints, parsed.points));
  return { points, feedback: parsed.feedback };
}
