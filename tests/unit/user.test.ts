import { describe, it, expect } from "vitest";
import { userCreateSchema } from "@/lib/validations/user";

describe("userCreateSchema", () => {
  it("aceita usuário com email institucional e role válida", () => {
    const r = userCreateSchema.safeParse({
      name: "Ana",
      email: "ana@unicentroma.edu.br",
      password: "123456",
      role: "PROFESSOR",
    });
    expect(r.success).toBe(true);
  });
  it("rejeita email não institucional", () => {
    const r = userCreateSchema.safeParse({
      name: "Ana",
      email: "ana@gmail.com",
      password: "123456",
      role: "PROFESSOR",
    });
    expect(r.success).toBe(false);
  });
  it("rejeita role inválida", () => {
    const r = userCreateSchema.safeParse({
      name: "Ana",
      email: "ana@unicentroma.edu.br",
      password: "123456",
      role: "REITOR",
    });
    expect(r.success).toBe(false);
  });
  it("rejeita senha curta", () => {
    expect(
      userCreateSchema.safeParse({
        name: "A",
        email: "a@unicentroma.edu.br",
        password: "12",
        role: "PROFESSOR",
      }).success
    ).toBe(false);
  });
});
