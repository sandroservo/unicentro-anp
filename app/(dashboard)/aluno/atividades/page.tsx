import { Header } from "@/components/layout/header";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const activities = [
  {
    id: "a1",
    title: "Quiz: Variáveis e Tipos de Dados",
    course: "Introdução à Programação",
    type: "quiz",
    status: "completed",
    grade: 9.5,
    deadline: "Entregue",
    points: 100,
  },
  {
    id: "a2",
    title: "Quiz: Estruturas de Controle",
    course: "Introdução à Programação",
    type: "quiz",
    status: "completed",
    grade: 8.0,
    deadline: "Entregue",
    points: 100,
  },
  {
    id: "a3",
    title: "Exercício: Funções em Python",
    course: "Introdução à Programação",
    type: "essay",
    status: "pending",
    deadline: "2 dias",
    points: 150,
  },
  {
    id: "a4",
    title: "Discussão: Boas práticas",
    course: "Introdução à Programação",
    type: "forum",
    status: "pending",
    deadline: "5 dias",
    points: 50,
  },
];

export default function AtividadesPage() {
  const pending = activities.filter((a) => a.status === "pending").length;
  const completed = activities.filter((a) => a.status === "completed").length;

  return (
    <>
      <Header title="Atividades" subtitle="Gerencie suas atividades e entregas" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-700">{pending}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Concluídas</p>
                <p className="text-3xl font-bold text-green-700">{completed}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-foreground">Todas as Atividades</h2>
          </div>
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === "quiz"
                        ? "bg-purple-100 text-purple-600"
                        : activity.type === "essay"
                        ? "bg-primary/10 text-primary"
                        : "bg-green-100 text-primary"
                    }`}
                  >
                    {activity.type === "quiz" && <ClipboardList size={20} />}
                    {activity.type === "essay" && <FileText size={20} />}
                    {activity.type === "forum" && <MessageSquare size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground">{activity.course}</p>
                  </div>
                  <div className="text-right">
                    {activity.status === "completed" ? (
                      <span className="text-primary font-medium">
                        Nota: {activity.grade}
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm">
                        Prazo: {activity.deadline}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
