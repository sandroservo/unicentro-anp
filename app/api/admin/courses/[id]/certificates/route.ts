import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ userId: z.string().min(1) });

// POST /api/admin/courses/[id]/certificates  (courses.write) — emite certificado
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.write");
    const { id: courseId } = await params;
    const { userId } = await parseBody(schema, request);

    const [course, user] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
    if (!course) return apiError("Curso não encontrado", 404);
    if (!user) return apiError("Aluno não encontrado", 404);

    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return apiError("Certificado já emitido para este aluno", 409);

    const cert = await prisma.certificate.create({
      data: { userId, courseId },
      select: { id: true },
    });
    return NextResponse.json({ id: cert.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao emitir certificado:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
