import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { CoursesTable } from "@/components/courses/courses-table";

export default async function CursosPage() {
  const session = await requirePermission("courses.read");
  const canWrite = session.user.permissions.includes("courses.write");

  return (
    <>
      <Header title="Turmas" subtitle="Crie turmas ANP e gerencie alunos, matérias e aulas" />
      <div className="space-y-6">
        <CoursesTable canWrite={canWrite} />
      </div>
    </>
  );
}
