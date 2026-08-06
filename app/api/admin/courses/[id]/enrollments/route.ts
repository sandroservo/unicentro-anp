import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { courseEnrollmentCreateSchema } from "@/lib/validations/enrollment";

type Ctx = { params: Promise<{ id: string }> };

/** GET — alunos matriculados na turma */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.read");
    const { id: courseId } = await ctx.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return apiError("Turma não encontrada", 404);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { matricula: true, status: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar matrículas:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

/** POST — matricula aluno na turma */
export async function POST(request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.write");
    const { id: courseId } = await ctx.params;
    const data = await parseBody(courseEnrollmentCreateSchema, request);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return apiError("Turma não encontrada", 404);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { studentProfile: true },
    });
    if (!user?.studentProfile) return apiError("Aluno não encontrado", 404);

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: data.userId, courseId } },
      create: { userId: data.userId, courseId, role: "STUDENT" },
      update: {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { matricula: true, status: true } },
          },
        },
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao matricular:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
