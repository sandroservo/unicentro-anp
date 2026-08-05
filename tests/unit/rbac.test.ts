import { describe, it, expect } from "vitest";
import { toRoleSlug, isAdminRole, ROLES } from "@/lib/rbac";

describe("toRoleSlug (backfill legado)", () => {
  it("mapeia strings legadas", () => {
    expect(toRoleSlug("STUDENT")).toBe("ALUNO");
    expect(toRoleSlug("TEACHER")).toBe("PROFESSOR");
    expect(toRoleSlug("ADMIN")).toBe("ADMINISTRADOR");
    expect(toRoleSlug("SUPER")).toBe("SUPER_ADMIN");
    expect(toRoleSlug("MONITOR")).toBe("TUTOR");
  });
  it("aceita slug novo direto", () => {
    expect(toRoleSlug("COORDENADOR")).toBe("COORDENADOR");
    expect(toRoleSlug("ALUNO")).toBe("ALUNO");
  });
  it("desconhecido/null -> ALUNO (fail-safe)", () => {
    expect(toRoleSlug(null)).toBe("ALUNO");
    expect(toRoleSlug("xpto")).toBe("ALUNO");
  });
});

describe("isAdminRole", () => {
  it("só SUPER_ADMIN e ADMINISTRADOR", () => {
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isAdminRole("ADMINISTRADOR")).toBe(true);
    expect(isAdminRole("COORDENADOR")).toBe(false);
    expect(isAdminRole("ALUNO")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});

describe("ROLES matriz", () => {
  it("ALUNO sem permissões; SUPER_ADMIN com todas", () => {
    const aluno = ROLES.find((r) => r.slug === "ALUNO")!;
    const sa = ROLES.find((r) => r.slug === "SUPER_ADMIN")!;
    expect(aluno.permissions).toHaveLength(0);
    expect(sa.permissions).toContain("users.manage");
  });
});
