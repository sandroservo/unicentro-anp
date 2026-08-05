import { describe, it, expect } from "vitest";
import { gradeObjective, type GradableQuestion } from "@/lib/grading";

const mc: GradableQuestion = {
  id: "q1", type: "MULTIPLE_CHOICE", points: 2,
  options: [{ text: "a", correct: false }, { text: "b", correct: true }],
};
const essay: GradableQuestion = { id: "q2", type: "ESSAY", points: 5, options: null };

describe("gradeObjective", () => {
  it("acerto objetivo soma pontos", () => {
    const r = gradeObjective([mc], { q1: [1] });
    expect(r).toEqual({ objectivePoints: 2, objectiveMax: 2, hasEssay: false });
  });
  it("erro objetivo não soma", () => {
    const r = gradeObjective([mc], { q1: [0] });
    expect(r.objectivePoints).toBe(0);
  });
  it("resposta parcial (falta uma correta) não pontua", () => {
    const multi: GradableQuestion = {
      id: "q3", type: "MULTIPLE_CHOICE", points: 3,
      options: [{ text: "a", correct: true }, { text: "b", correct: true }, { text: "c", correct: false }],
    };
    expect(gradeObjective([multi], { q3: [0] }).objectivePoints).toBe(0);
    expect(gradeObjective([multi], { q3: [0, 1] }).objectivePoints).toBe(3);
  });
  it("detecta dissertativa pendente", () => {
    const r = gradeObjective([mc, essay], { q1: [1] });
    expect(r).toEqual({ objectivePoints: 2, objectiveMax: 2, hasEssay: true });
  });
  it("sem resposta -> 0", () => {
    expect(gradeObjective([mc], {}).objectivePoints).toBe(0);
  });
});
