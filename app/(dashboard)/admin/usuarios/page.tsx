import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { UsersTable } from "@/components/users/users-table";

export default async function UsuariosPage() {
  await requirePermission("users.manage");

  return (
    <div className="flex flex-col h-full">
      <Header title="Usuários" subtitle="Gestão de usuários e tipos de acesso" />
      <div className="flex-1 p-6 overflow-auto">
        <UsersTable />
      </div>
    </div>
  );
}
