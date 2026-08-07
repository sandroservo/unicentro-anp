import { redirect } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { MyCertificates } from "@/components/certificates/my-certificates";
import { studentCanSeeCertificates } from "@/lib/certificates-access";

export default async function CertificadosPage() {
  const session = await requireSession();
  const visible = await studentCanSeeCertificates(
    session.user!.id!,
    session.user?.role
  );
  if (!visible) redirect("/aluno");

  return (
    <>
      <Header title="Certificados" subtitle="Seus certificados de conclusão" />
      <div className="space-y-6">
        <MyCertificates />
      </div>
    </>
  );
}
