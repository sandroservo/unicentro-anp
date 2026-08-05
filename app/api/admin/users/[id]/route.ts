import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { userUpdateSchema } from "@/lib/validations/user";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id]  (users.manage)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("users.manage");
    const { id } = await params;
    const data = await parseBody(userUpdateSchema, request);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("Usuário não encontrado", 404);

    let roleId: string | undefined;
    if (data.role) {
      const role = await prisma.role.findUnique({ where: { slug: data.role } });
      if (!role) return apiError("Tipo de usuário inválido", 400);
      roleId = role.id;
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.role ? { role: data.role, roleId } : {}),
        ...(data.password ? { password: await hash(data.password, 12) } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar usuário:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/users/[id]  (users.manage) — bloqueia auto-exclusão
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const session = await requirePermission("users.manage");
    const { id } = await params;
    if (id === session.user.id) return apiError("Você não pode excluir a si mesmo", 400);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("Usuário não encontrado", 404);

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao remover usuário:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
