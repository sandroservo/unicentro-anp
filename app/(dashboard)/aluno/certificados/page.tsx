import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { MyCertificates } from "@/components/certificates/my-certificates";

export default async function CertificadosPage() {
  await requireSession();
  return (
    <>
      <Header title="Certificados" subtitle="Seus certificados de conclusão" />
      <div className="space-y-6">
        <MyCertificates />
      </div>
    </>
  );
}
