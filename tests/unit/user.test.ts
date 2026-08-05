import { describe, it, expect } from "vitest";
import { userCreateSchema } from "@/lib/validations/user";

describe("userCreateSchema", () => {
  it("aceita usuário com role válida", () => {
    const r = userCreateSchema.safeParse({
      name: "Ana", email: "a@x.com", password: "123456", role: "PROFESSOR",
    });
    expect(r.success).toBe(true);
  });
  it("rejeita role inválida", () => {
    const r = userCreateSchema.safeParse({
      name: "Ana", email: "a@x.com", password: "123456", role: "REITOR",
    });
    expect(r.success).toBe(false);
  });
  it("rejeita senha curta", () => {
    expect(userCreateSchema.safeParse({ name: "A", email: "a@x.com", password: "12", role: "ALUNO" }).success).toBe(false);
  });
});
