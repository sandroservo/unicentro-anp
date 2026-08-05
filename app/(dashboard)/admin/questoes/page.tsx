import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { QuestionsTable } from "@/components/questions/questions-table";

export default async function QuestoesPage() {
  const session = await requirePermission("courses.read");
  const canWrite = session.user.permissions.includes("questions.write");

  return (
    <>
      <Header title="Banco de Questões" subtitle="Pool reusável de questões" />
      <div className="space-y-6">
        <QuestionsTable canWrite={canWrite} />
      </div>
    </>
  );
}
