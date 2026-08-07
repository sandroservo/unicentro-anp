import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, ApiError, parseBody } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { assertLessonAccess } from "@/lib/enrollment-access";

type Ctx = { params: Promise<{ id: string }> };

const replySchema = z.object({
  content: z.string().trim().min(2, "Escreva a resposta"),
});

// POST /api/aluno/forum/[id] — responder discussão
export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const { id } = await params;
    const { content } = await parseBody(replySchema, request);

    const parent = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, lessonId: true, parentId: true, isResolved: true },
    });
    if (!parent || parent.parentId) {
      return apiError("Discussão não encontrada", 404);
    }
    if (parent.isResolved) {
      return apiError("Esta discussão já foi resolvida", 422);
    }

    await assertLessonAccess(userId, parent.lessonId, session.user.role);

    const reply = await prisma.forumPost.create({
      data: {
        lessonId: parent.lessonId,
        userId,
        content,
        parentId: parent.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: reply.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao responder discussão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

const upvoteSchema = z.object({
  action: z.literal("upvote"),
});

// PATCH /api/aluno/forum/[id] — curtir discussão
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await parseBody(upvoteSchema, request);

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, lessonId: true, parentId: true },
    });
    if (!post || post.parentId) {
      return apiError("Discussão não encontrada", 404);
    }

    await assertLessonAccess(
      session.user.id!,
      post.lessonId,
      session.user.role
    );

    const updated = await prisma.forumPost.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      select: { id: true, upvotes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao curtir discussão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
