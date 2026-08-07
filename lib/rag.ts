import { searchKnowledge, type SearchHit } from "@/lib/knowledge";

// Seleciona chunks relevantes: acima de minScore e dentro do orçamento de chars. Puro.
export function selectContext(
  hits: SearchHit[],
  opts?: { minScore?: number; maxChars?: number }
): SearchHit[] {
  const minScore = opts?.minScore ?? 0.05;
  const maxChars = opts?.maxChars ?? 2000;
  const out: SearchHit[] = [];
  let total = 0;
  for (const h of hits) {
    if (h.score < minScore) continue;
    if (total + h.content.length > maxChars) break;
    out.push(h);
    total += h.content.length;
  }
  return out;
}

// Formata os chunks num bloco numerado. Puro.
export function formatContext(hits: SearchHit[]): string {
  if (!hits.length) return "";
  return hits.map((h, i) => `[${i + 1}] ${h.content}`).join("\n\n");
}

// Injeta o contexto no system prompt. Puro.
export function augmentSystemPrompt(base: string, context: string): string {
  if (!context) return base;
  return `${base}

Use o CONTEXTO abaixo (material do curso) para responder. Se a resposta não estiver no contexto, diga que não encontrou no material e responda com conhecimento geral com cautela.

CONTEXTO:
${context}`;
}

// Recupera contexto RAG pra uma pergunta (busca vetorial + seleção).
export async function retrieveContext(
  query: string,
  opts?: { courseId?: string | null; k?: number }
): Promise<{ context: string; sources: SearchHit[] }> {
  try {
    const hits = await searchKnowledge(query, opts?.k ?? 6, {
      courseId: opts?.courseId,
    });
    const selected = selectContext(hits);
    return { context: formatContext(selected), sources: selected };
  } catch (e) {
    // Sem coluna embedding / pgvector: tutor ainda responde via OmniRoute.
    console.warn("RAG indisponível:", e instanceof Error ? e.message : e);
    return { context: "", sources: [] };
  }
}
