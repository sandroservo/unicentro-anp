import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  assertLessonAccess,
  canPreviewStudentView,
} from "@/lib/enrollment-access";
import { ApiError } from "@/lib/api";
import { LessonViewer } from "@/components/lessons/lesson-viewer";

type Props = { params: Promise<{ cursoId: string; aulaId: string }> };

export default async function AulaAlunoPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { cursoId, aulaId } = await params;

  try {
    await assertLessonAccess(session.user.id, aulaId, session.user.role);
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) redirect(`/aluno/cursos/${cursoId}`);
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const full = await prisma.lesson.findUnique({
    where: { id: aulaId },
    include: {
      module: {
        select: {
          title: true,
          description: true,
          courseId: true,
          subject: { select: { title: true } },
          course: { select: { title: true } },
        },
      },
      materials: { orderBy: { order: "asc" } },
      progress: {
        where: { userId: session.user.id },
        select: { completed: true, videoProgress: true },
        take: 1,
      },
    },
  });
  if (!full || full.module.courseId !== cursoId) notFound();

  const progress = full.progress[0];

  return (
    <LessonViewer
      cursoId={cursoId}
      courseTitle={full.module.course.title}
      subjectTitle={full.module.subject?.title}
      moduleTitle={full.module.title}
      moduleDescription={full.module.description}
      lesson={{
        id: full.id,
        title: full.title,
        description: full.description,
        videoId: full.videoId,
        transcript: full.transcript,
      }}
      materials={full.materials.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        url: m.url,
      }))}
      initialCompleted={progress?.completed ?? false}
      initialVideoProgress={progress?.videoProgress ?? 0}
      allowCompleteWithoutWatch={canPreviewStudentView(session.user.role)}
    />
  );
}
