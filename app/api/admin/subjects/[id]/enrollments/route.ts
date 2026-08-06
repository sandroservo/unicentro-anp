import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { subjectEnrollmentCreateSchema } from "@/lib/validations/enrollment";

type Ctx = { params: Promise<{ id: string }> };

/** GET — alunos vinculados à matéria */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.read");
    const { id: subjectId } = await ctx.params;

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) return apiError("Matéria não encontrada", 404);

    const enrollments = await prisma.subjectEnrollment.findMany({
      where: { subjectId },
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
    console.error("Erro ao listar vínculos da matéria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

/**
 * POST — vincula aluno à matéria.
 * Se ainda não estiver na turma do curso, matricula automaticamente.
 */
export async function POST(request: Request, ctx: Ctx) {
  try {
    await requirePermission("students.write");
    const { id: subjectId } = await ctx.params;
    const data = await parseBody(subjectEnrollmentCreateSchema, request);

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) return apiError("Matéria não encontrada", 404);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { studentProfile: true },
    });
    if (!user?.studentProfile) return apiError("Aluno não encontrado", 404);

    const enrollment = await prisma.$transaction(async (tx) => {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: { userId: data.userId, courseId: subject.courseId },
        },
        create: { userId: data.userId, courseId: subject.courseId, role: "STUDENT" },
        update: {},
      });

      return tx.subjectEnrollment.upsert({
        where: { userId_subjectId: { userId: data.userId, subjectId } },
        create: { userId: data.userId, subjectId },
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
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao vincular aluno à matéria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
