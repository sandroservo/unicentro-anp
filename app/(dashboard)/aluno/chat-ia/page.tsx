"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import {
  Brain,
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const courses = [
  { id: "c1", name: "Introdução à Programação", persona: "Professor Python" },
  { id: "c2", name: "Banco de Dados", persona: "Professor SQL" },
  { id: "c3", name: "Redes de Computadores", persona: "Professor Networks" },
];

const suggestions = [
  "Explique o conceito de funções",
  "Como criar uma lista em Python?",
  "O que são variáveis?",
  "Diferença entre for e while",
  "Me dê um exercício prático",
  "Resuma a última aula",
];

export default function ChatIAPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Olá! 👋 Sou o **${courses[0].persona}**, seu Professor Virtual de ${courses[0].name}.

Estou aqui para ajudar você com:
- 📚 Dúvidas sobre o conteúdo das aulas
- 💡 Explicações de conceitos
- 📝 Exercícios práticos
- 🔍 Revisão de matéria

Como posso ajudar você hoje?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            courseName: selectedCourse.name,
            courseDescription: `Curso de ${selectedCourse.name}`,
            aiPersona: selectedCourse.persona,
          },
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua pergunta.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setShowCourseSelector(false);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: `Olá! 👋 Sou o **${course.persona}**, seu Professor Virtual de ${course.name}.

Estou aqui para ajudar você com qualquer dúvida sobre o curso. O que gostaria de saber?`,
        timestamp: new Date(),
      },
    ]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: `Chat limpo! Sou o **${selectedCourse.persona}**. Como posso ajudar?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Professor Virtual" subtitle="Tire suas dúvidas com IA" />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Course Selector */}
          <div className="bg-white border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowCourseSelector(!showCourseSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BookOpen size={18} className="text-primary" />
                  <span className="font-medium text-gray-700">
                    {selectedCourse.name}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showCourseSelector && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseChange(course)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                          selectedCourse.id === course.id && "bg-primary/10"
                        )}
                      >
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <p className="text-sm text-gray-500">{course.persona}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span className="text-sm">Limpar</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/100 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={20} className="text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm",
                    msg.role === "user"
                      ? "bg-primary/100 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border"
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={msg.role === "user" ? "text-white" : ""}>
                        {line.startsWith("```") ? (
                          <code className="block bg-gray-100 p-2 rounded mt-2 text-sm font-mono overflow-x-auto">
                            {line.replace(/```\w*/, "").replace("```", "")}
                          </code>
                        ) : line.startsWith("- ") ? (
                          <span className="block pl-4">• {line.slice(2)}</span>
                        ) : (
                          line
                            .split(/(\*\*.*?\*\*)/g)
                            .map((part, j) =>
                              part.startsWith("**") && part.endsWith("**") ? (
                                <strong key={j}>{part.slice(2, -2)}</strong>
                              ) : part.startsWith("`") && part.endsWith("`") ? (
                                <code
                                  key={j}
                                  className="bg-gray-100 px-1 rounded text-sm"
                                >
                                  {part.slice(1, -1)}
                                </code>
                              ) : (
                                part
                              )
                            )
                        )}
                      </p>
                    ))}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-2",
                      msg.role === "user" ? "text-primary-foreground" : "text-gray-400"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/100 to-purple-500 flex items-center justify-center shadow-md">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-yellow-500" />
                <span className="text-sm text-gray-500">Sugestões</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-primary/90 hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-primary/100 to-primary text-white rounded-xl font-medium hover:from-primary hover:to-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Tips */}
        <aside className="hidden lg:block w-80 bg-white border-l p-4 overflow-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-primary" size={20} />
              <h3 className="font-semibold text-gray-900">
                {selectedCourse.persona}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Especialista em {selectedCourse.name}. Posso ajudar com dúvidas,
              exercícios e revisões.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <h4 className="font-medium text-primary mb-2">💡 Dica</h4>
              <p className="text-sm text-primary">
                Seja específico nas suas perguntas para obter respostas mais
                úteis. Por exemplo: "Como criar uma função que soma dois números
                em Python?"
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-900 mb-2">📝 Exercícios</h4>
              <p className="text-sm text-green-700">
                Peça exercícios práticos para fixar o conteúdo. Exemplo: "Me dê
                um exercício sobre listas"
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-900 mb-2">🔍 Revisão</h4>
              <p className="text-sm text-purple-700">
                Solicite um resumo da matéria antes de provas. Exemplo: "Resuma
                os principais conceitos de funções"
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
