"use client";

import { useState, use } from "react";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Bot,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dados mockados
const courseData = {
  id: "c1",
  title: "Introdução à Programação",
  description:
    "Aprenda os fundamentos da programação com Python. Este curso abrange desde conceitos básicos até a criação do seu primeiro projeto completo.",
  aiPersona: "Professor Python",
  aiDescription:
    "Sou especialista em Python e programação para iniciantes. Posso te ajudar com dúvidas sobre sintaxe, lógica de programação e boas práticas.",
  progress: 75,
  modules: [
    {
      id: "m1",
      title: "Módulo 1: Fundamentos",
      lessons: [
        { id: "l1", title: "Introdução ao Python", duration: "15min", completed: true },
        { id: "l2", title: "Variáveis e Tipos de Dados", duration: "20min", completed: true },
        { id: "l3", title: "Operadores", duration: "18min", completed: true },
        { id: "l4", title: "Estruturas de Controle", duration: "25min", completed: true },
      ],
    },
    {
      id: "m2",
      title: "Módulo 2: Funções e Estruturas",
      lessons: [
        { id: "l5", title: "Listas e Tuplas", duration: "22min", completed: true },
        { id: "l6", title: "Dicionários", duration: "20min", completed: true },
        { id: "l7", title: "Funções", duration: "30min", completed: false },
        { id: "l8", title: "Módulos e Pacotes", duration: "25min", completed: false },
      ],
    },
    {
      id: "m3",
      title: "Módulo 3: Programação Orientada a Objetos",
      lessons: [
        { id: "l9", title: "Classes e Objetos", duration: "35min", completed: false },
        { id: "l10", title: "Herança", duration: "28min", completed: false },
        { id: "l11", title: "Polimorfismo", duration: "25min", completed: false },
        { id: "l12", title: "Projeto Final", duration: "45min", completed: false },
      ],
    },
  ],
};

export default function CursoDetailPage({ params }: { params: Promise<{ cursoId: string }> }) {
  const { cursoId } = use(params);
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1", "m2"]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = courseData.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedLessons = courseData.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title={courseData.title}
        subtitle={`${completedLessons} de ${totalLessons} aulas concluídas`}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Módulos e Aulas */}
          <div className="lg:col-span-2 space-y-4">
            {courseData.modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              const moduleCompleted = module.lessons.every((l) => l.completed);
              const moduleLessonsCompleted = module.lessons.filter(
                (l) => l.completed
              ).length;

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          moduleCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {moduleCompleted ? (
                          <CheckCircle size={18} />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {moduleLessonsCompleted}/{module.lessons.length} aulas
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </button>

                  {/* Lessons */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {module.lessons.map((lesson, index) => (
                        <Link
                          key={lesson.id}
                          href={`/aluno/cursos/${cursoId}/aulas/${lesson.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                              lesson.completed
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {lesson.completed ? (
                              <CheckCircle size={16} />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "font-medium",
                                lesson.completed
                                  ? "text-gray-500"
                                  : "text-gray-900"
                              )}
                            >
                              {lesson.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{lesson.duration}</span>
                          </div>
                          <PlayCircle
                            size={20}
                            className={cn(
                              lesson.completed
                                ? "text-green-500"
                                : "text-primary"
                            )}
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Seu Progresso</h3>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {courseData.progress}% concluído
                  </span>
                  <span className="text-sm text-gray-500">
                    {completedLessons}/{totalLessons} aulas
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/100 to-primary rounded-full"
                    style={{ width: `${courseData.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Professor Virtual Card */}
            <div className="bg-gradient-to-br from-primary/100 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{courseData.aiPersona}</h3>
                  <p className="text-sm text-primary-foreground">Professor Virtual</p>
                </div>
              </div>
              <p className="text-sm text-primary-foreground mb-4">
                {courseData.aiDescription}
              </p>
              <Link
                href="/aluno/chat-ia"
                className="block w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center font-medium transition-colors"
              >
                Tirar Dúvida
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href={`/aluno/cursos/${cursoId}/materiais`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText size={20} className="text-orange-500" />
                  <span className="text-gray-700">Ver Materiais</span>
                </Link>
                <Link
                  href="/aluno/forum"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare size={20} className="text-green-500" />
                  <span className="text-gray-700">Acessar Fórum</span>
                </Link>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Users size={20} className="text-primary" />
                  <span className="text-gray-700">156 alunos matriculados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
