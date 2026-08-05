import prisma from "@/lib/prisma";
import { hashEmbedding, toVectorLiteral } from "@/lib/embeddings";

// Divide texto em chunks ~maxLen chars, quebrando por frase. Puro/testável.
export function chunkText(text: string, maxLen = 500): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + " " + s).length > maxLen) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? cur + " " + s : s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

export type KnowledgeMeta = {
  title: string;
  courseId?: string | null;
  lessonId?: string | null;
  sourceType?: string;
};

// Cria KnowledgeBase + chunks embedados (embedding via SQL raw).
export async function indexKnowledge(meta: KnowledgeMeta, text: string) {
  const chunks = chunkText(text);
  const kb = await prisma.knowledgeBase.create({
    data: {
      title: meta.title,
      courseId: meta.courseId ?? null,
      lessonId: meta.lessonId ?? null,
      sourceType: meta.sourceType ?? "manual",
    },
    select: { id: true },
  });

  for (let i = 0; i < chunks.length; i++) {
    const chunk = await prisma.knowledgeChunk.create({
      data: { knowledgeBaseId: kb.id, content: chunks[i], order: i },
      select: { id: true },
    });
    const lit = toVectorLiteral(hashEmbedding(chunks[i]));
    await prisma.$executeRaw`UPDATE "KnowledgeChunk" SET embedding = ${lit}::vector WHERE id = ${chunk.id}`;
  }

  return { knowledgeBaseId: kb.id, chunkCount: chunks.length };
}

export type SearchHit = { id: string; content: string; knowledgeBaseId: string; score: number };

// Busca vetorial (cosseno pgvector). Filtro opcional por curso.
export async function searchKnowledge(
  query: string,
  k = 5,
  filter?: { courseId?: string | null }
): Promise<SearchHit[]> {
  // Literal do vetor inline (só números, gerado por nós — sem risco de injeção).
  // Passar como parâmetro com ::vector faz o operador <=> retornar 0 linhas (type inference pgvector).
  const lit = toVectorLiteral(hashEmbedding(query));
  const kInt = Math.min(50, Math.max(1, Math.floor(k)));

  const params: unknown[] = [];
  let join = "";
  if (filter?.courseId) {
    params.push(filter.courseId);
    join = `JOIN "KnowledgeBase" kb ON kb.id = c."knowledgeBaseId" AND kb."courseId" = $${params.length}`;
  }

  const sql = `
    SELECT c.id, c.content, c."knowledgeBaseId",
           1 - (c.embedding <=> '${lit}'::vector) AS score
    FROM "KnowledgeChunk" c
    ${join}
    WHERE c.embedding IS NOT NULL
    ORDER BY c.embedding <=> '${lit}'::vector
    LIMIT ${kInt}`;

  const rows = await prisma.$queryRawUnsafe<SearchHit[]>(sql, ...params);
  return rows.map((r) => ({ ...r, score: Number(r.score) }));
}
