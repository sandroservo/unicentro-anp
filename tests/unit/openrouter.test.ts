import { describe, it, expect } from "vitest";
import { extractGradeJson } from "@/lib/ai/openrouter";

describe("extractGradeJson", () => {
  it("JSON limpo", () => {
    expect(extractGradeJson('{"points": 4, "feedback": "bom"}')).toEqual({ points: 4, feedback: "bom" });
  });
  it("JSON com ruído/markdown ao redor", () => {
    const raw = 'Claro!\n```json\n{"points": 3, "feedback": "ok"}\n```\nEspero ter ajudado.';
    expect(extractGradeJson(raw)).toEqual({ points: 3, feedback: "ok" });
  });
  it("sem points numérico -> null", () => {
    expect(extractGradeJson('{"feedback": "x"}')).toBeNull();
  });
  it("texto sem JSON -> null", () => {
    expect(extractGradeJson("nota 10, muito bom")).toBeNull();
  });
});
