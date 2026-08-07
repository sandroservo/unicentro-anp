import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/authz";
import { slugify } from "@/lib/utils";
import { courseCreateSchema } from "@/lib/validations/course";

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "curso";
  let slug = base;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// GET /api/admin/courses?q=&active=  (courses.read)
export async function GET(request: Request) {
  try {
    await requirePermission("courses.read");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const active = searchParams.get("active");

    const courses = await prisma.course.findMany({
      where: {
        ...(active === "true" ? { isActive: true } : active === "false" ? { isActive: false } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { code: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        workloadHours: true,
        isActive: true,
        certificatesEnabled: true,
        slug: true,
        aiPersona: true,
        aiContext: true,
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar cursos:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// POST /api/admin/courses  (courses.write)
export async function POST(request: Request) {
  try {
    await requirePermission("courses.write");
    const data = await parseBody(courseCreateSchema, request);

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        slug: await uniqueSlug(data.title),
        code: data.code || null,
        workloadHours: data.workloadHours ?? null,
        isActive: data.isActive ?? true,
        certificatesEnabled: data.certificatesEnabled ?? false,
        aiPersona: data.aiPersona || null,
        aiContext: data.aiContext || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: course.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao criar curso:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
