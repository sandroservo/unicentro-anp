"use client";

import { useState, use } from "react";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Brain,
  Send,
  Bot,
  User,
  CheckCircle,
  Clock,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dados mockados da aula
const lessonData = {
  id: "l7",
  title: "Funções em Python",
  description: "Aprenda a criar e utilizar funções para organizar e reutilizar seu código.",
  videoId: "dQw4w9WgXcQ", // ID do vídeo do YouTube
  duration: "30:00",
  transcript: `Nesta aula, vamos aprender sobre funções em Python.
  
Funções são blocos de código reutilizáveis que executam uma tarefa específica.

Para criar uma função em Python, usamos a palavra-chave 'def':

def saudacao(nome):
    return f"Olá, {nome}!"

Podemos chamar a função assim:
mensagem = saudacao("Maria")
print(mensagem)  # Olá, Maria!`,
  materials: [
    { id: "mat1", title: "Slides da Aula", type: "pdf", size: "2.3 MB" },
    { id: "mat2", title: "Exercícios Práticos", type: "pdf", size: "1.1 MB" },
    { id: "mat3", title: "Código de Exemplo", type: "py", size: "4 KB" },
  ],
  prevLesson: { id: "l6", title: "Dicionários" },
  nextLesson: { id: "l8", title: "Módulos e Pacotes" },
};

type ChatMessage = { id: number; role: "user" | "assistant"; content: string };

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Olá! Sou o Professor Virtual de Programação. Estou aqui para ajudar com suas dúvidas sobre a aula de Funções em Python. O que gostaria de saber?",
  },
];

export default function AulaPage({
  params,
}: {
  params: Promise<{ cursoId: string; aulaId: string }>;
}) {
  const { cursoId } = use(params);
  const [activeTab, setActiveTab] = useState<"materials" | "chat" | "transcript">("chat");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular resposta da IA (em produção, chamaria a API)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: getAIResponse(input),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Respostas simuladas baseadas em palavras-chave
  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes("def") || q.includes("criar função")) {
      return `Para criar uma função em Python, use a palavra-chave \`def\`:

\`\`\`python
def nome_da_funcao(parametros):
    # código da função
    return resultado
\`\`\`

**Exemplo prático:**
\`\`\`python
def soma(a, b):
    return a + b

resultado = soma(5, 3)
print(resultado)  # 8
\`\`\`

Quer que eu explique mais sobre parâmetros ou retorno de funções?`;
    }
    
    if (q.includes("parâmetro") || q.includes("argumento")) {
      return `**Parâmetros vs Argumentos:**

- **Parâmetros** são as variáveis definidas na declaração da função
- **Argumentos** são os valores passados ao chamar a função

\`\`\`python
def saudacao(nome, idade):  # nome e idade são parâmetros
    return f"{nome} tem {idade} anos"

# "Maria" e 25 são argumentos
mensagem = saudacao("Maria", 25)
\`\`\`

Você também pode usar parâmetros com valores padrão:
\`\`\`python
def saudacao(nome, idade=18):  # idade tem valor padrão
    return f"{nome} tem {idade} anos"
\`\`\``;
    }
    
    if (q.includes("return") || q.includes("retorno")) {
      return `O \`return\` é usado para devolver um valor da função:

\`\`\`python
def quadrado(n):
    return n ** 2

resultado = quadrado(4)  # resultado = 16
\`\`\`

**Pontos importantes:**
- Uma função pode retornar qualquer tipo de dado
- Pode retornar múltiplos valores usando tupla
- Se não houver return, a função retorna \`None\`

\`\`\`python
def operacoes(a, b):
    return a + b, a - b, a * b  # retorna tupla

soma, sub, mult = operacoes(10, 5)
\`\`\``;
    }

    return `Ótima pergunta sobre funções! 

Baseado no conteúdo da aula, posso te ajudar a entender melhor. Funções são fundamentais em Python pois permitem:

1. **Reutilização de código** - Escreva uma vez, use várias vezes
2. **Organização** - Divida problemas grandes em partes menores
3. **Manutenção** - Facilita encontrar e corrigir erros

Você gostaria que eu explicasse algum conceito específico como:
- Como criar funções com \`def\`
- Parâmetros e argumentos
- Retorno de valores com \`return\`
- Escopo de variáveis`;
  };

  return (
    <div className="-m-4 flex h-[calc(100vh-80px)] flex-col md:-m-6">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <Header
          title={lessonData.title}
          subtitle="Introdução à Programação"
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Main Content - Video */}
        <div className="flex flex-1 flex-col">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${lessonData.videoId}?rel=0`}
              title={lessonData.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Info & Navigation */}
          <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {lessonData.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {lessonData.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/aluno/cursos/${cursoId}/aulas/${lessonData.prevLesson.id}`}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={lessonData.prevLesson.title}
                >
                  <ChevronLeft size={20} />
                </Link>
                <Link
                  href={`/aluno/cursos/${cursoId}/aulas/${lessonData.nextLesson.id}`}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={lessonData.nextLesson.title}
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary/100 text-white rounded-lg hover:bg-green-600 transition-colors">
                <CheckCircle size={18} />
                Marcar como Concluída
              </button>
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/100 text-white rounded-lg hover:bg-primary/90 transition-colors md:hidden"
              >
                <Brain size={18} />
                Tirar Dúvida
              </button>
            </div>
          </div>

          {/* Tabs for Mobile */}
          <div className="flex-1 overflow-auto p-4 bg-muted md:hidden">
            <div className="flex gap-2 mb-4">
              {["materials", "transcript"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === tab
                      ? "bg-primary/100 text-white"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tab === "materials" ? "Materiais" : "Transcrição"}
                </button>
              ))}
            </div>

            {activeTab === "materials" && (
              <div className="space-y-2">
                {lessonData.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{material.title}</p>
                        <p className="text-xs text-muted-foreground">{material.size}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg">
                      <Download size={18} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="bg-card rounded-lg border p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {lessonData.transcript}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Chat & Materials (Desktop) */}
        <aside className="hidden md:flex w-96 border-l bg-card flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: "chat", label: "Professor IA", icon: Brain },
              { id: "materials", label: "Materiais", icon: FileText },
              { id: "transcript", label: "Transcrição", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "chat" && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/100 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Bot size={16} className="text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] px-4 py-2 rounded-2xl",
                          msg.role === "user"
                            ? "bg-primary/100 text-white rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/100 to-purple-500 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></span>
                          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></span>
                          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {["Como criar função?", "O que é return?", "Parâmetros"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium whitespace-nowrap hover:bg-primary/90 transition-colors"
                        >
                          {suggestion}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Digite sua dúvida..."
                      className="flex-1 px-4 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-primary/100 text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "materials" && (
              <div className="p-4 space-y-2 overflow-auto">
                {lessonData.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {material.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {material.type.toUpperCase()} • {material.size}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Download size={18} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="p-4 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                  {lessonData.transcript}
                </pre>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Brain className="text-primary" size={20} />
                <span className="font-semibold">Professor Virtual</span>
              </div>
              <button onClick={() => setChatOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/100 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl",
                      msg.role === "user"
                        ? "bg-primary/100 text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 px-4 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-primary/100 text-white rounded-xl"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
