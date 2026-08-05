import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { buildGradebook } from "@/lib/gradebook";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/courses/[id]/gradebook  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: courseId } = await params;

    const activities = await prisma.activity.findMany({
      where: { lesson: { module: { courseId } } },
      select: { id: true, title: true },
      orderBy: { id: "asc" },
    });

    const activityIds = activities.map((a) => a.id);
    const submissions = activityIds.length
      ? await prisma.submission.findMany({
          where: { activityId: { in: activityIds } },
          select: { userId: true, activityId: true, finalGrade: true, user: { select: { name: true } } },
        })
      : [];

    const gb = buildGradebook(
      activities,
      submissions.map((s) => ({
        userId: s.userId,
        userName: s.user.name,
        activityId: s.activityId,
        finalGrade: s.finalGrade,
      }))
    );

    return NextResponse.json(gb);
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao montar notas:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
