import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, ApiError, parseBody } from "@/lib/api";
import { requirePermission } from "@/lib/authz";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  isResolved: z.boolean().optional(),
});

const replySchema = z.object({
  content: z.string().trim().min(2, "Escreva a resposta"),
});

// PATCH /api/admin/forum/[id] — marcar resolvido/aberto
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("courses.read");
    const { id } = await params;
    const data = await parseBody(patchSchema, request);

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, parentId: true },
    });
    if (!post || post.parentId) {
      return apiError("Discussão não encontrada", 404);
    }

    const updated = await prisma.forumPost.update({
      where: { id },
      data: {
        ...(data.isResolved !== undefined
          ? { isResolved: data.isResolved }
          : {}),
      },
      select: { id: true, isResolved: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao atualizar discussão:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/forum/[id] — responder como admin
export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await requirePermission("courses.read");
    const { id } = await params;
    const { content } = await parseBody(replySchema, request);

    const parent = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, lessonId: true, parentId: true },
    });
    if (!parent || parent.parentId) {
      return apiError("Discussão não encontrada", 404);
    }

    const reply = await prisma.forumPost.create({
      data: {
        lessonId: parent.lessonId,
        userId: session.user.id!,
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
