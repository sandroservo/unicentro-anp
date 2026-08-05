import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { StudentsTable } from "@/components/students/students-table";

export default async function AlunosPage() {
  const session = await requirePermission("students.read");
  const canWrite = session.user.permissions.includes("students.write");

  return (
    <>
      <Header title="Alunos" subtitle="Gestão de alunos" />
      <div className="space-y-6">
        <StudentsTable canWrite={canWrite} />
      </div>
    </>
  );
}
