import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { generateCertificatePdf } from "@/lib/certificate";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/certificates/[id]/pdf  (sessão) — baixa o PDF gerado on-the-fly
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requireSession();
    const { id } = await params;

    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, certificatesEnabled: true } },
      },
    });
    if (!cert) return apiError("Certificado não encontrado", 404);
    if (!cert.course.certificatesEnabled) {
      return apiError("Certificados desativados para esta turma", 403);
    }

    const dateStr = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(cert.issuedAt);
    const bytes = await generateCertificatePdf({
      studentName: cert.user.name,
      courseName: cert.course.title,
      code: cert.id,
      dateStr,
    });

    return new Response(bytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificado-${cert.id}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao gerar PDF:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
