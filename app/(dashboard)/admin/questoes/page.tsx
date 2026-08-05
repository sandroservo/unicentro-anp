import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { QuestionsTable } from "@/components/questions/questions-table";

export default async function QuestoesPage() {
  const session = await requirePermission("courses.read");
  const canWrite = session.user.permissions.includes("questions.write");

  return (
    <div className="flex flex-col h-full">
      <Header title="Banco de Questões" subtitle="Pool reusável de questões" />
      <div className="flex-1 p-6 overflow-auto">
        <QuestionsTable canWrite={canWrite} />
      </div>
    </div>
  );
}
