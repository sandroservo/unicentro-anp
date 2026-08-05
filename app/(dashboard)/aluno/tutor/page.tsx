import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { TutorChat } from "@/components/tutor/tutor-chat";

export default async function TutorPage() {
  await requireSession();
  return (
    <div className="flex flex-col h-full">
      <Header title="Professor IA" subtitle="Tutor com base no material (RAG)" />
      <div className="flex-1 p-6 overflow-auto">
        <TutorChat />
      </div>
    </div>
  );
}
