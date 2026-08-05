import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { categoryCreateSchema } from "@/lib/validations/question";

// GET /api/admin/question-categories  (courses.read)
export async function GET() {
  try {
    await requirePermission("courses.read");
    const categories = await prisma.questionCategory.findMany({
      select: { id: true, name: true, _count: { select: { questions: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar categorias:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/question-categories  (questions.write)
export async function POST(request: Request) {
  try {
    await requirePermission("questions.write");
    const data = await parseBody(categoryCreateSchema, request);
    const dup = await prisma.questionCategory.findUnique({ where: { name: data.name } });
    if (dup) return apiError("Categoria já existe", 409);
    const cat = await prisma.questionCategory.create({ data: { name: data.name }, select: { id: true } });
    return NextResponse.json({ id: cat.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar categoria:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
