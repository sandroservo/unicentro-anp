import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { userCreateSchema } from "@/lib/validations/user";

// GET /api/admin/users?q=&role=  (users.manage)
export async function GET(request: Request) {
  try {
    await requirePermission("users.manage");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role")?.trim();

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { roleRel: { slug: role } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleRel: { select: { slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar usuários:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/users  (users.manage)
export async function POST(request: Request) {
  try {
    await requirePermission("users.manage");
    const data = await parseBody(userCreateSchema, request);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Este email já está cadastrado", 409);

    const role = await prisma.role.findUnique({ where: { slug: data.role } });
    if (!role) return apiError("Tipo de usuário inválido", 400);

    const hashedPassword = await hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        roleId: role.id,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar usuário:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
