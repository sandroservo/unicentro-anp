import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { questionCreateSchema } from "@/lib/validations/question";

// GET /api/admin/questions?q=&categoryId=&type=  (courses.read)
export async function GET(request: Request) {
  try {
    await requirePermission("courses.read");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();
    const type = searchParams.get("type")?.trim();

    const questions = await prisma.question.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(type ? { type } : {}),
        ...(q ? { statement: { contains: q, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        type: true,
        statement: true,
        options: true,
        answerKey: true,
        points: true,
        categoryId: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar questões:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/questions  (questions.write)
export async function POST(request: Request) {
  try {
    await requirePermission("questions.write");
    const data = await parseBody(questionCreateSchema, request);
    const question = await prisma.question.create({
      data: {
        type: data.type,
        statement: data.statement,
        options: data.options ? JSON.stringify(data.options) : null,
        answerKey: data.answerKey || null,
        points: data.points ?? 1,
        categoryId: data.categoryId || null,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: question.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar questão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
