import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils";
import { courseCreateSchema } from "@/lib/validations/course";

describe("slugify", () => {
  it("remove acentos e hifeniza", () => {
    expect(slugify("Introdução à Programação")).toBe("introducao-a-programacao");
  });
  it("colapsa espaços/símbolos", () => {
    expect(slugify("  Banco   de   Dados!!  ")).toBe("banco-de-dados");
  });
  it("vazio -> vazio", () => {
    expect(slugify("@#$")).toBe("");
  });
});

describe("courseCreateSchema", () => {
  it("aceita curso válido e coage workloadHours", () => {
    const r = courseCreateSchema.safeParse({
      title: "Cálculo I", description: "Limites e derivadas", workloadHours: "60",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.workloadHours).toBe(60);
  });
  it("rejeita título vazio", () => {
    expect(courseCreateSchema.safeParse({ title: "", description: "x" }).success).toBe(false);
  });
  it("rejeita carga horária negativa", () => {
    expect(
      courseCreateSchema.safeParse({ title: "x", description: "y", workloadHours: -5 }).success
    ).toBe(false);
  });
});
