import { describe, it, expect } from "vitest";
import { hashEmbedding, cosine, EMBED_DIM, toVectorLiteral } from "@/lib/embeddings";
import { chunkText } from "@/lib/knowledge";

describe("hashEmbedding", () => {
  it("determinístico e com dimensão fixa", () => {
    const a = hashEmbedding("programação em python");
    const b = hashEmbedding("programação em python");
    expect(a).toEqual(b);
    expect(a.length).toBe(EMBED_DIM);
  });
  it("textos similares mais próximos que dissimilares", () => {
    const q = hashEmbedding("função em python");
    const similar = hashEmbedding("como criar uma função em python");
    const different = hashEmbedding("história da revolução francesa");
    expect(cosine(q, similar)).toBeGreaterThan(cosine(q, different));
  });
});

describe("toVectorLiteral", () => {
  it("formata literal pgvector", () => {
    expect(toVectorLiteral([1, 0.5])).toBe("[1.000000,0.500000]");
  });
});

describe("chunkText", () => {
  it("vazio -> []", () => {
    expect(chunkText("   ")).toEqual([]);
  });
  it("quebra por frase respeitando maxLen", () => {
    const text = "Uma frase. Outra frase aqui. Terceira frase final.";
    const chunks = chunkText(text, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ").replace(/\s+/g, " ")).toContain("Terceira");
  });
});
