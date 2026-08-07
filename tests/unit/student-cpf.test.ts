import { describe, it, expect } from "vitest";
import { isValidCPF, studentCreateSchema } from "@/lib/validations/student";
import { maskCPF, maskPhone } from "@/lib/masks";

describe("isValidCPF", () => {
  it("aceita CPF válido (com e sem máscara)", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("52998224725")).toBe(true);
  });
  it("rejeita dígitos verificadores errados", () => {
    expect(isValidCPF("529.982.247-24")).toBe(false);
  });
  it("rejeita repetidos e tamanho errado", () => {
    expect(isValidCPF("111.111.111-11")).toBe(false);
    expect(isValidCPF("123")).toBe(false);
  });
});

describe("studentCreateSchema", () => {
  it("normaliza CPF e exige email institucional", () => {
    const r = studentCreateSchema.parse({
      name: "Ana",
      email: "ana@unicentroma.edu.br",
      matricula: "A1",
      cpf: "529.982.247-25",
    });
    expect(r.cpf).toBe("52998224725");
    expect(r.email).toBe("ana@unicentroma.edu.br");
  });
});

describe("máscaras", () => {
  it("maskCPF formata progressivamente", () => {
    expect(maskCPF("52998224725")).toBe("529.982.247-25");
    expect(maskCPF("529982")).toBe("529.982");
  });
  it("maskPhone formata 10 e 11 dígitos", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
    expect(maskPhone("1132654321")).toBe("(11) 3265-4321");
  });
});
