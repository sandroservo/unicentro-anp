import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { SubmissionsList } from "@/components/grading/submissions-list";

export default async function CorrecaoPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const session = await requirePermission("courses.read");
  const { activityId } = await params;
  const canWrite = session.user.permissions.includes("lessons.write");

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { title: true },
  });
  if (!activity) notFound();

  return (
    <>
      <Header title={`Correção · ${activity.title}`} subtitle="Submissões" />
      <div className="space-y-6">
        <SubmissionsList activityId={activityId} canWrite={canWrite} />
      </div>
    </>
  );
}
