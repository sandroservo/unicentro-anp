import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { MyCertificates } from "@/components/certificates/my-certificates";

export default async function CertificadosPage() {
  await requireSession();
  return (
    <div className="flex flex-col h-full">
      <Header title="Certificados" subtitle="Seus certificados de conclusão" />
      <div className="flex-1 p-6 overflow-auto">
        <MyCertificates />
      </div>
    </div>
  );
}
