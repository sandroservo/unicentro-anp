import { describe, it, expect } from "vitest";
import { studentCreateSchema, studentUpdateSchema } from "@/lib/validations/student";

describe("studentCreateSchema", () => {
  it("aceita aluno válido", () => {
    const r = studentCreateSchema.safeParse({
      name: "João", email: "j@x.com", matricula: "2024001", password: "123456",
    });
    expect(r.success).toBe(true);
  });
  it("rejeita matrícula vazia", () => {
    const r = studentCreateSchema.safeParse({
      name: "João", email: "j@x.com", matricula: "", password: "123456",
    });
    expect(r.success).toBe(false);
  });
  it("rejeita senha curta", () => {
    const r = studentCreateSchema.safeParse({
      name: "João", email: "j@x.com", matricula: "1", password: "123",
    });
    expect(r.success).toBe(false);
  });
  it("rejeita email inválido", () => {
    const r = studentCreateSchema.safeParse({
      name: "João", email: "nope", matricula: "1", password: "123456",
    });
    expect(r.success).toBe(false);
  });
});

describe("studentUpdateSchema", () => {
  it("aceita status válido", () => {
    expect(studentUpdateSchema.safeParse({ status: "INATIVO" }).success).toBe(true);
  });
  it("rejeita status inválido", () => {
    expect(studentUpdateSchema.safeParse({ status: "SUMIU" }).success).toBe(false);
  });
});
