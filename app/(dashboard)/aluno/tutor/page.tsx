import { requireSession } from "@/lib/authz";
import { Header } from "@/components/layout/header";
import { TutorChat } from "@/components/tutor/tutor-chat";

export default async function TutorPage() {
  await requireSession();
  return (
    <>
      <Header title="Professor IA" subtitle="Tutor com base no material (RAG)" />
      <div className="space-y-6">
        <TutorChat />
      </div>
    </>
  );
}
