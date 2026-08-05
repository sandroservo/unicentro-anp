import { describe, it, expect } from "vitest";
import { parseIsoDuration } from "@/lib/youtube";

describe("parseIsoDuration", () => {
  it("horas+min+seg", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
  });
  it("só minutos e segundos", () => {
    expect(parseIsoDuration("PT15M30S")).toBe(930);
  });
  it("só segundos", () => {
    expect(parseIsoDuration("PT45S")).toBe(45);
  });
  it("só minutos", () => {
    expect(parseIsoDuration("PT10M")).toBe(600);
  });
  it("inválido -> 0", () => {
    expect(parseIsoDuration("xyz")).toBe(0);
  });
});
