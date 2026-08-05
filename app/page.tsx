import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/rbac";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  redirect(isAdminRole(session.user?.role) ? "/admin" : "/aluno");
}
