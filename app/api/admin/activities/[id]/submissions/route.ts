import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/activities/[id]/submissions  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: activityId } = await params;
    const submissions = await prisma.submission.findMany({
      where: { activityId },
      select: {
        id: true, answers: true, aiGrade: true, finalGrade: true, aiFeedback: true,
        attempt: true, submittedAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar submissões:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
