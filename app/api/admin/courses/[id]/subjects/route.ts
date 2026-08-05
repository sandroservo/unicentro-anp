import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { subjectCreateSchema } from "@/lib/validations/subject";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/courses/[id]/subjects  (courses.read)
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id: courseId } = await params;

    const subjects = await prisma.subject.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        code: true,
        order: true,
        _count: { select: { modules: true } },
      },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar disciplinas:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/courses/[id]/subjects  (subjects.write)
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requirePermission("subjects.write");
    const { id: courseId } = await params;
    const data = await parseBody(subjectCreateSchema, request);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return apiError("Curso não encontrado", 404);

    const subject = await prisma.subject.create({
      data: {
        courseId,
        title: data.title,
        code: data.code || null,
        order: data.order ?? 0,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: subject.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar disciplina:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
