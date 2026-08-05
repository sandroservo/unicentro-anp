import { describe, it, expect } from "vitest";
import { parseTimedText } from "@/lib/transcript";

describe("parseTimedText", () => {
  it("extrai texto e decodifica entidades", () => {
    const xml = `<?xml version="1.0"?><transcript>` +
      `<text start="0" dur="2">Olá&#39; mundo</text>` +
      `<text start="2" dur="2">Python &amp; código</text>` +
      `</transcript>`;
    expect(parseTimedText(xml)).toBe("Olá' mundo Python & código");
  });
  it("xml vazio -> string vazia", () => {
    expect(parseTimedText("<transcript></transcript>")).toBe("");
  });
  it("colapsa espaços/newlines", () => {
    const xml = `<transcript><text>linha um\nlinha dois</text></transcript>`;
    expect(parseTimedText(xml)).toBe("linha um linha dois");
  });
});
