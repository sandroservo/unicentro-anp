import { describe, it, expect } from "vitest";
import { subjectCreateSchema } from "@/lib/validations/subject";

describe("subjectCreateSchema", () => {
  it("aceita disciplina válida e coage order", () => {
    const r = subjectCreateSchema.safeParse({ title: "Cálculo", code: "MAT1", order: "2" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.order).toBe(2);
  });
  it("rejeita título vazio", () => {
    expect(subjectCreateSchema.safeParse({ title: "" }).success).toBe(false);
  });
  it("rejeita order negativa", () => {
    expect(subjectCreateSchema.safeParse({ title: "x", order: -1 }).success).toBe(false);
  });
});
