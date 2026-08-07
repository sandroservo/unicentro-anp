import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { studentCanSeeCertificates } from "@/lib/certificates-access";

// GET /api/aluno/certificates  (sessão) — certificados do próprio aluno
export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const visible = await studentCanSeeCertificates(userId, session.user.role);

    if (!visible) {
      return NextResponse.json({ certificates: [], visible: false });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
        course: { certificatesEnabled: true },
      },
      select: { id: true, issuedAt: true, course: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json({ certificates, visible: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar certificados:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
