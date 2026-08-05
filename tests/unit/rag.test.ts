import { describe, it, expect } from "vitest";
import { selectContext, formatContext, augmentSystemPrompt } from "@/lib/rag";
import type { SearchHit } from "@/lib/knowledge";

const h = (id: string, content: string, score: number): SearchHit => ({ id, content, knowledgeBaseId: "kb", score });

describe("selectContext", () => {
  it("filtra por minScore", () => {
    const r = selectContext([h("1", "aaa", 0.5), h("2", "bbb", 0.01)], { minScore: 0.1 });
    expect(r.map((x) => x.id)).toEqual(["1"]);
  });
  it("respeita maxChars", () => {
    const r = selectContext([h("1", "x".repeat(30), 0.9), h("2", "y".repeat(30), 0.9)], { maxChars: 40 });
    expect(r.length).toBe(1);
  });
});

describe("formatContext", () => {
  it("numera chunks; vazio -> ''", () => {
    expect(formatContext([])).toBe("");
    expect(formatContext([h("1", "abc", 0.9), h("2", "def", 0.8)])).toBe("[1] abc\n\n[2] def");
  });
});

describe("augmentSystemPrompt", () => {
  it("sem contexto retorna base", () => {
    expect(augmentSystemPrompt("BASE", "")).toBe("BASE");
  });
  it("injeta contexto", () => {
    const out = augmentSystemPrompt("BASE", "[1] xyz");
    expect(out).toContain("BASE");
    expect(out).toContain("CONTEXTO:");
    expect(out).toContain("[1] xyz");
  });
});
