import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";

// GET /api/aluno/certificates  (sessão) — certificados do próprio aluno
export async function GET() {
  try {
    const session = await requireSession();
    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      select: { id: true, issuedAt: true, course: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json({ certificates });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar certificados:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
