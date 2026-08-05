import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { StudentsTable } from "@/components/students/students-table";

export default async function AlunosPage() {
  const session = await requirePermission("students.read");
  const canWrite = session.user.permissions.includes("students.write");

  return (
    <div className="flex flex-col h-full">
      <Header title="Alunos" subtitle="Gestão de alunos" />
      <div className="flex-1 p-6 overflow-auto">
        <StudentsTable canWrite={canWrite} />
      </div>
    </div>
  );
}
