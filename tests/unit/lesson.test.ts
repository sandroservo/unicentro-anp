import { describe, it, expect } from "vitest";
import { moduleCreateSchema, lessonCreateSchema } from "@/lib/validations/lesson";

describe("moduleCreateSchema", () => {
  it("aceita módulo válido", () => {
    expect(moduleCreateSchema.safeParse({ title: "M1", order: "1" }).success).toBe(true);
  });
  it("rejeita título vazio", () => {
    expect(moduleCreateSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("lessonCreateSchema", () => {
  it("aceita aula com videoUrl válido", () => {
    const r = lessonCreateSchema.safeParse({ title: "Aula 1", videoUrl: "https://youtu.be/abc" });
    expect(r.success).toBe(true);
  });
  it("aceita videoUrl vazio (opcional)", () => {
    expect(lessonCreateSchema.safeParse({ title: "Aula 1", videoUrl: "" }).success).toBe(true);
  });
  it("rejeita videoUrl não-URL", () => {
    expect(lessonCreateSchema.safeParse({ title: "Aula 1", videoUrl: "nao-url" }).success).toBe(false);
  });
});
