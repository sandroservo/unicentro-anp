import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { SemanticSearch } from "@/components/search/semantic-search";

export default async function BuscaPage() {
  await requireSession();
  return (
    <>
      <Header title="Busca Semântica" subtitle="Encontre trechos do material por significado" />
      <div className="space-y-6">
        <SemanticSearch />
      </div>
    </>
  );
}
