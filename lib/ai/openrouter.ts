import { getSetting } from "@/lib/settings";

export async function getOpenRouterKey(): Promise<string | null> {
  const fromDb = await getSetting("openrouter_api_key");
  return fromDb || process.env.OPENROUTER_API_KEY || null;
}

async function getModel(): Promise<string> {
  return (await getSetting("openrouter_model")) || "openai/gpt-4o-mini";
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

// Chama OpenRouter (compatível OpenAI). Lança Error("NO_API_KEY") sem chave.
async function callOpenRouter(prompt: string): Promise<string> {
  const key = await getOpenRouterKey();
  if (!key) throw new Error("NO_API_KEY");
  const model = await getModel();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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
