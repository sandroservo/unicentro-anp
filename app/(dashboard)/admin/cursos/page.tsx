import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { CoursesTable } from "@/components/courses/courses-table";

export default async function CursosPage() {
  const session = await requirePermission("courses.read");
  const canWrite = session.user.permissions.includes("courses.write");

  return (
    <div className="flex flex-col h-full">
      <Header title="Cursos" subtitle="Gestão de cursos" />
      <div className="flex-1 p-6 overflow-auto">
        <CoursesTable canWrite={canWrite} />
      </div>
    </div>
  );
}
