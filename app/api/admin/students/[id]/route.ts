import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { studentUpdateSchema } from "@/lib/validations/student";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/students/[id] — edita (students.write)
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requirePermission("students.write");
    const { id } = await params;
    const data = await parseBody(studentUpdateSchema, request);

    const profile = await prisma.studentProfile.findUnique({ where: { id } });
    if (!profile) return apiError("Aluno não encontrado", 404);

    if (data.matricula && data.matricula !== profile.matricula) {
      const dup = await prisma.studentProfile.findUnique({
        where: { matricula: data.matricula },
      });
      if (dup) return apiError("Esta matrícula já existe", 409);
    }
    if (data.cpf && data.cpf !== profile.cpf) {
      const dup = await prisma.studentProfile.findUnique({
        where: { cpf: data.cpf },
      });
      if (dup) return apiError("Este CPF já está cadastrado", 409);
    }

    // Se o CPF mudar, a senha de login do aluno também muda (senha = CPF)
    const passwordUpdate =
      data.cpf && data.cpf !== profile.cpf
        ? { password: await hash(data.cpf, 12) }
        : {};

    await prisma.studentProfile.update({
      where: { id },
      data: {
        ...(data.matricula ? { matricula: data.matricula } : {}),
        ...(data.cpf ? { cpf: data.cpf } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...((data.name || Object.keys(passwordUpdate).length > 0)
          ? {
              user: {
                update: {
                  ...(data.name ? { name: data.name } : {}),
                  ...passwordUpdate,
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao editar aluno:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// DELETE /api/admin/students/[id] — inativa (soft) (students.write)
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requirePermission("students.write");
    const { id } = await params;

    const profile = await prisma.studentProfile.findUnique({ where: { id } });
    if (!profile) return apiError("Aluno não encontrado", 404);

    await prisma.studentProfile.update({
      where: { id },
      data: { status: "INATIVO" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao inativar aluno:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
