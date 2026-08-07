import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { studentCreateSchema } from "@/lib/validations/student";

// GET /api/admin/students?q=&status=  — lista alunos (students.read)
export async function GET(request: Request) {
  try {
    await requirePermission("students.read");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim();

    const students = await prisma.studentProfile.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { matricula: { contains: q, mode: "insensitive" } },
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar alunos:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/students — cria User(role ALUNO) + StudentProfile (students.write)
export async function POST(request: Request) {
  try {
    await requirePermission("students.write");
    const data = await parseBody(studentCreateSchema, request);

    const alunoRole = await prisma.role.findUnique({ where: { slug: "ALUNO" } });

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Este email já está cadastrado", 409);
    const dupMat = await prisma.studentProfile.findUnique({
      where: { matricula: data.matricula },
    });
    if (dupMat) return apiError("Esta matrícula já existe", 409);
    const dupCpf = await prisma.studentProfile.findUnique({
      where: { cpf: data.cpf },
    });
    if (dupCpf) return apiError("Este CPF já está cadastrado", 409);

    // Senha do aluno = CPF (apenas dígitos)
    const hashedPassword = await hash(data.cpf, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "ALUNO",
        roleId: alunoRole?.id ?? null,
        studentProfile: {
          create: {
            matricula: data.matricula,
            cpf: data.cpf,
            phone: data.phone || null,
          },
        },
      },
      include: { studentProfile: true },
    });

    return NextResponse.json(
      { id: user.studentProfile!.id, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar aluno:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
