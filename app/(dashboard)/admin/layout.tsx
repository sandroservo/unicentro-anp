import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role?.toUpperCase?.() ?? "";

  if (!session) {
    redirect("/login");
  }
  if (role !== "ADMIN" && role !== "SUPER") {
    redirect("/aluno");
  }

  return <>{children}</>;
}
