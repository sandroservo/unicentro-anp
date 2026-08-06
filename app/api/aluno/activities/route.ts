import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { canPreviewStudentView } from "@/lib/enrollment-access";

// GET /api/aluno/activities — atividades das turmas/matérias do aluno
export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id!;
    const isPreview = canPreviewStudentView(session.user.role);

    const activities = await prisma.activity.findMany({
      where: isPreview
        ? undefined
        : {
            lesson: {
              module: {
                OR: [
                  {
                    subjectId: null,
                    course: { enrollments: { some: { userId } } },
                  },
                  {
                    subject: { enrollments: { some: { userId } } },
                  },
                ],
              },
            },
          },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        points: true,
        dueDate: true,
        lesson: {
          select: {
            title: true,
            module: {
              select: {
                course: { select: { id: true, title: true } },
                subject: { select: { title: true } },
              },
            },
          },
        },
        submissions: {
          where: { userId },
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: {
            id: true,
            finalGrade: true,
            submittedAt: true,
            aiGrade: true,
          },
        },
        _count: { select: { activityQuestions: true } },
      },
      orderBy: [{ dueDate: "asc" }, { id: "desc" }],
    });

    return NextResponse.json({
      activities: activities.map((a) => {
        const sub = a.submissions[0] ?? null;
        const status = sub ? "completed" : "pending";
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          type: a.type,
          points: a.points,
          dueDate: a.dueDate,
          courseTitle: a.lesson.module.course.title,
          courseId: a.lesson.module.course.id,
          lessonTitle: a.lesson.title,
          subjectTitle: a.lesson.module.subject?.title ?? null,
          questionsCount: a._count.activityQuestions,
          status,
          grade: sub?.finalGrade ?? sub?.aiGrade ?? null,
          submittedAt: sub?.submittedAt ?? null,
        };
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao listar atividades do aluno:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
