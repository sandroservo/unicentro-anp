import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, ApiError, parseBody } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { assertLessonAccess } from "@/lib/enrollment-access";

const createSchema = z.object({
  lessonId: z.string().min(1, "Selecione uma aula"),
  content: z.string().trim().min(5, "Escreva ao menos 5 caracteres"),
});

// POST /api/aluno/forum — nova discussão (post raiz) numa aula matriculada
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const { lessonId, content } = await parseBody(createSchema, request);

    await assertLessonAccess(userId, lessonId, session.user.role);

    const post = await prisma.forumPost.create({
      data: { lessonId, userId, content },
      select: { id: true },
    });

    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar discussão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
