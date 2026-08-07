import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { canPreviewStudentView } from "@/lib/enrollment-access";
import prisma from "@/lib/prisma";
import { TutorPageClient } from "./tutor-page-client";

export default async function TutorPage() {
  const session = await requireSession();
  const userId = session.user!.id!;
  const preview = canPreviewStudentView(session.user?.role);

  const courses = preview
    ? await prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
        take: 50,
      })
    : (
        await prisma.enrollment.findMany({
          where: { userId },
          select: { course: { select: { id: true, title: true } } },
          orderBy: { enrolledAt: "desc" },
          take: 50,
        })
      ).map((e) => e.course);

  return (
    <>
      <Header
        title="Professor IA"
        subtitle="Tutoria inteligente com base no material da sua turma"
      />
      <div className="pb-4">
        <TutorPageClient courses={courses} />
      </div>
    </>
  );
}
