import { describe, it, expect } from "vitest";
import { questionCreateSchema } from "@/lib/validations/question";

describe("questionCreateSchema", () => {
  it("MC válida com ≥1 correta", () => {
    const r = questionCreateSchema.safeParse({
      type: "MULTIPLE_CHOICE", statement: "2+2?",
      options: [{ text: "3", correct: false }, { text: "4", correct: true }],
    });
    expect(r.success).toBe(true);
  });
  it("MC sem correta -> falha", () => {
    const r = questionCreateSchema.safeParse({
      type: "MULTIPLE_CHOICE", statement: "x",
      options: [{ text: "a", correct: false }, { text: "b", correct: false }],
    });
    expect(r.success).toBe(false);
  });
  it("MC com <2 opções -> falha", () => {
    const r = questionCreateSchema.safeParse({
      type: "MULTIPLE_CHOICE", statement: "x", options: [{ text: "a", correct: true }],
    });
    expect(r.success).toBe(false);
  });
  it("ESSAY sem options -> ok", () => {
    const r = questionCreateSchema.safeParse({ type: "ESSAY", statement: "Disserte..." });
    expect(r.success).toBe(true);
  });
  it("enunciado vazio -> falha", () => {
    expect(questionCreateSchema.safeParse({ type: "ESSAY", statement: "" }).success).toBe(false);
  });
});
