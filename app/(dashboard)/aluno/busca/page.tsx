import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { SemanticSearch } from "@/components/search/semantic-search";

export default async function BuscaPage() {
  await requireSession();
  return (
    <div className="flex flex-col h-full">
      <Header title="Busca Semântica" subtitle="Encontre trechos do material por significado" />
      <div className="flex-1 p-6 overflow-auto">
        <SemanticSearch />
      </div>
    </div>
  );
}
