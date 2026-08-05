// Embeddings determinísticos (dev, sem API): hashing trick para vetor de dimensão fixa.
// Textos com palavras em comum ficam próximos por cosseno. Trocar por API real depois.

export const EMBED_DIM = 384;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .match(/[a-z0-9]+/g) ?? []
  );
}

export function hashEmbedding(text: string, dim = EMBED_DIM): number[] {
  const v = new Array(dim).fill(0);
  for (const t of tokenize(text)) {
    const idx = hashStr(t) % dim;
    const sign = hashStr(t + "#") % 2 ? 1 : -1;
    v[idx] += sign;
  }
  const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
  return v.map((x) => x / norm);
}

// Literal pgvector: "[0.1,0.2,...]"
export function toVectorLiteral(vec: number[]): string {
  return "[" + vec.map((x) => x.toFixed(6)).join(",") + "]";
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
