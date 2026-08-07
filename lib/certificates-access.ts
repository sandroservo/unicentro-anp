import prisma from "@/lib/prisma";
import { canPreviewStudentView } from "@/lib/enrollment-access";

/** Aluno só vê certificados se tiver turma com o recurso ativo. */
export async function studentCanSeeCertificates(
  userId: string,
  role?: string | null
): Promise<boolean> {
  if (canPreviewStudentView(role)) {
    const n = await prisma.course.count({
      where: { certificatesEnabled: true, isActive: true },
    });
    return n > 0;
  }

  const n = await prisma.enrollment.count({
    where: { userId, course: { certificatesEnabled: true } },
  });
  return n > 0;
}
