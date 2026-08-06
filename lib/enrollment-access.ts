import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { isAdminRole } from "@/lib/rbac";

/** Admin pode pré-visualizar o painel do aluno sem matrícula. */
export function canPreviewStudentView(role?: string | null) {
  return isAdminRole(role);
}

/** Garante matrícula do aluno na turma (Course). */
export async function assertCourseEnrollment(
  userId: string,
  courseId: string,
  role?: string | null
) {
  if (canPreviewStudentView(role)) return null;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) throw new ApiError(403, "Você não está matriculado nesta turma");
  return enrollment;
}

/** Garante vínculo do aluno com a matéria (Subject). */
export async function assertSubjectEnrollment(
  userId: string,
  subjectId: string,
  role?: string | null
) {
  if (canPreviewStudentView(role)) return null;
  const enrollment = await prisma.subjectEnrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  });
  if (!enrollment) throw new ApiError(403, "Você não está vinculado a esta matéria");
  return enrollment;
}

/** IDs das matérias às quais o aluno tem acesso num curso/turma. */
export async function getStudentSubjectIds(userId: string, courseId?: string) {
  const rows = await prisma.subjectEnrollment.findMany({
    where: {
      userId,
      ...(courseId ? { subject: { courseId } } : {}),
    },
    select: { subjectId: true },
  });
  return rows.map((r) => r.subjectId);
}

/** Garante acesso à aula: aluno deve estar vinculado à matéria da aula. */
export async function assertLessonAccess(
  userId: string,
  lessonId: string,
  role?: string | null
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { select: { subjectId: true, courseId: true } },
    },
  });
  if (!lesson) throw new ApiError(404, "Aula não encontrada");
  if (canPreviewStudentView(role)) return lesson;

  const subjectId = lesson.module.subjectId;
  if (!subjectId) {
    // Aula sem matéria: basta matrícula na turma
    await assertCourseEnrollment(userId, lesson.module.courseId, role);
    return lesson;
  }

  await assertSubjectEnrollment(userId, subjectId, role);
  return lesson;
}
