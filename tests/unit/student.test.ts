import { describe, it, expect } from "vitest";
import {
  studentCreateSchema,
  studentUpdateSchema,
  isValidCPF,
} from "@/lib/validations/student";

const validCpf = "52998224725";

describe("isValidCPF", () => {
  it("aceita CPF válido", () => {
    expect(isValidCPF(validCpf)).toBe(true);
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });
  it("rejeita CPF inválido", () => {
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("123")).toBe(false);
  });
});

describe("studentCreateSchema", () => {
  it("aceita aluno com email institucional e CPF", () => {
    const r = studentCreateSchema.safeParse({
      name: "João",
      email: "joao@unicentroma.edu.br",
      matricula: "2024001",
      cpf: "529.982.247-25",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cpf).toBe(validCpf);
      expect(r.data.email).toBe("joao@unicentroma.edu.br");
    }
  });
  it("rejeita email não institucional", () => {
    const r = studentCreateSchema.safeParse({
      name: "João",
      email: "joao@gmail.com",
      matricula: "2024001",
      cpf: validCpf,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita matrícula vazia", () => {
    const r = studentCreateSchema.safeParse({
      name: "João",
      email: "joao@unicentroma.edu.br",
      matricula: "",
      cpf: validCpf,
    });
    expect(r.success).toBe(false);
  });
  it("rejeita CPF inválido", () => {
    const r = studentCreateSchema.safeParse({
      name: "João",
      email: "joao@unicentroma.edu.br",
      matricula: "1",
      cpf: "12345678900",
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
