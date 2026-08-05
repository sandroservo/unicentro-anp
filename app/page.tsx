import Link from "next/link";
import {
  GraduationCap,
  Brain,
  BookOpen,
  Users,
  PlayCircle,
  MessageSquare,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl text-gray-800">ANP</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-gray-600 hover:text-gray-900">
              Recursos
            </a>
            <a href="#como-funciona" className="text-gray-600 hover:text-gray-900">
              Como Funciona
            </a>
            <a href="#professor-virtual" className="text-gray-600 hover:text-gray-900">
              Professor Virtual
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Brain size={16} />
              <span>Powered by AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Aprenda com um{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Professor Virtual
              </span>{" "}
              sempre disponível
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plataforma de aulas não presenciais com inteligência artificial.
              Tire dúvidas, faça exercícios e receba feedback instantâneo 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                Começar Agora
                <ArrowRight size={20} />
              </Link>
              <Link
                href="#como-funciona"
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} />
                Ver Como Funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para aprender
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Uma plataforma completa com recursos pensados para maximizar seu
              aprendizado
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: PlayCircle,
                title: "Vídeo-aulas",
                description:
                  "Assista às aulas no seu ritmo, com marcadores de capítulos e anotações",
                color: "blue",
              },
              {
                icon: Brain,
                title: "Professor Virtual IA",
                description:
                  "Tire dúvidas 24/7 com um professor especialista em cada matéria",
                color: "purple",
              },
              {
                icon: BookOpen,
                title: "Materiais de Apoio",
                description:
                  "PDFs, slides e documentos complementares para aprofundar o estudo",
                color: "green",
              },
              {
                icon: CheckCircle,
                title: "Atividades Interativas",
                description:
                  "Quizzes, exercícios dissertativos com correção automática por IA",
                color: "orange",
              },
              {
                icon: MessageSquare,
                title: "Fórum de Discussão",
                description:
                  "Interaja com colegas e receba respostas do Professor Virtual",
                color: "pink",
              },
              {
                icon: Users,
                title: "Acompanhamento",
                description:
                  "Monitores e professores acompanham seu progresso de perto",
                color: "cyan",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`text-${feature.color}-600`} size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professor Virtual Section */}
      <section id="professor-virtual" className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Conheça o Professor Virtual
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Cada disciplina tem seu próprio professor virtual especialista,
                treinado com o conteúdo do curso para oferecer o melhor suporte.
              </p>
              <ul className="space-y-4">
                {[
                  "Responde dúvidas baseado no conteúdo das aulas",
                  "Corrige atividades com feedback detalhado",
                  "Gera exercícios personalizados para praticar",
                  "Interage no fórum ajudando todos os alunos",
                  "Disponível 24 horas por dia, 7 dias por semana",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Professor Virtual</p>
                  <p className="text-sm text-gray-500">Introdução à Programação</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                    Qual a diferença entre let e const?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="mb-2">Ótima pergunta! A diferença principal é:</p>
                    <p className="mb-2">
                      <strong>let</strong>: permite reatribuição de valor
                    </p>
                    <p className="mb-2">
                      <strong>const</strong>: valor não pode ser alterado após declaração
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Quer ver exemplos práticos? 💡
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pronto para começar?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Crie sua conta gratuitamente e experimente uma nova forma de
              aprender
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Criar Conta Grátis
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={18} />
              </div>
              <span className="font-bold text-gray-800">ANP</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 ANP - Aulas Não Presenciais. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
