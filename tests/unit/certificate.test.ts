import { describe, it, expect } from "vitest";
import { generateCertificatePdf } from "@/lib/certificate";

describe("generateCertificatePdf", () => {
  it("gera bytes de PDF válido (%PDF)", async () => {
    const bytes = await generateCertificatePdf({
      studentName: "João Silva",
      courseName: "Introdução à Programação",
      code: "cert-123",
      dateStr: "5 de agosto de 2026",
    });
    expect(bytes.length).toBeGreaterThan(500);
    const header = String.fromCharCode(...bytes.slice(0, 5));
    expect(header).toBe("%PDF-");
  });
});
