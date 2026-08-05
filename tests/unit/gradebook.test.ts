import { describe, it, expect } from "vitest";
import { buildGradebook } from "@/lib/gradebook";

const acts = [{ id: "a1", title: "A1" }, { id: "a2", title: "A2" }];

describe("buildGradebook", () => {
  it("melhor tentativa por atividade + média", () => {
    const gb = buildGradebook(acts, [
      { userId: "u1", userName: "Ana", activityId: "a1", finalGrade: 5 },
      { userId: "u1", userName: "Ana", activityId: "a1", finalGrade: 8 }, // melhor
      { userId: "u1", userName: "Ana", activityId: "a2", finalGrade: 6 },
    ]);
    const row = gb.rows[0];
    expect(row.grades.a1).toBe(8);
    expect(row.grades.a2).toBe(6);
    expect(row.average).toBe(7);
  });
  it("nota pendente (null) não entra na média", () => {
    const gb = buildGradebook(acts, [
      { userId: "u1", userName: "Bia", activityId: "a1", finalGrade: 10 },
      { userId: "u1", userName: "Bia", activityId: "a2", finalGrade: null },
    ]);
    expect(gb.rows[0].average).toBe(10);
    expect(gb.rows[0].grades.a2).toBeNull();
  });
  it("ordena por nome", () => {
    const gb = buildGradebook(acts, [
      { userId: "u2", userName: "Zoe", activityId: "a1", finalGrade: 1 },
      { userId: "u1", userName: "Ana", activityId: "a1", finalGrade: 2 },
    ]);
    expect(gb.rows.map((r) => r.name)).toEqual(["Ana", "Zoe"]);
  });
});
