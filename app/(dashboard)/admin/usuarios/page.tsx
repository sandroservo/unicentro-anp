import { requirePermission } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { UsersTable } from "@/components/users/users-table";

export default async function UsuariosPage() {
  await requirePermission("users.manage");

  return (
    <>
      <Header title="Usuários" subtitle="Gestão de usuários e tipos de acesso" />
      <div className="space-y-6">
        <UsersTable />
      </div>
    </>
  );
}
