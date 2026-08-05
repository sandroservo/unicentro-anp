import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const { name, email, password } = await parseBody(registerSchema, request);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError("Este email já está cadastrado", 400);
    }

    const hashedPassword = await hash(password, 12);
    const alunoRole = await prisma.role.findUnique({ where: { slug: "ALUNO" } });
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ALUNO",
        roleId: alunoRole?.id ?? null,
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao registrar:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
