import { Header } from "@/components/layout/header";
import Link from "next/link";
import { Settings, Users, BarChart3, Brain, ChevronRight } from "lucide-react";

const adminLinks = [
  { href: "/admin/configuracoes", label: "Configurações (IA)", icon: Settings, desc: "Provedor de IA, API keys e modelos" },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, desc: "Gerenciar usuários e perfis" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, desc: "Métricas e relatórios" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-500 mt-1">Configure o sistema e gerencie a plataforma.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="text-blue-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-800">{item.label}</h2>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <Brain className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-800">Professor Virtual (IA)</p>
              <p className="text-sm text-blue-700 mt-1">
                As chaves de API são configuradas no painel <strong>Configurações</strong>, não no .env.
                Escolha Anthropic (Claude) ou OpenAI (GPT) e informe a chave correspondente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
