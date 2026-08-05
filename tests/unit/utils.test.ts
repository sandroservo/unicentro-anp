import { describe, it, expect } from "vitest";
import { getYouTubeVideoId, getYouTubeThumbnail, formatDuration } from "@/lib/utils";

describe("getYouTubeVideoId", () => {
  it("extrai id de watch?v=", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai id de youtu.be", () => {
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extrai id de embed", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("retorna null pra url inválida", () => {
    expect(getYouTubeVideoId("https://example.com/foo")).toBeNull();
  });
});

describe("getYouTubeThumbnail", () => {
  it("monta url do thumbnail", () => {
    expect(getYouTubeThumbnail("abc12345678")).toBe("https://img.youtube.com/vi/abc12345678/maxresdefault.jpg");
  });
});

describe("formatDuration", () => {
  it("formata com horas", () => {
    expect(formatDuration(3661)).toBe("1h 1min");
  });
  it("formata só minutos/segundos", () => {
    expect(formatDuration(125)).toBe("2min 5s");
  });
});
