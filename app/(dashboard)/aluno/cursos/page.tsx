import { Header } from "@/components/layout/header";
import Link from "next/link";
import { BookOpen, Users, Clock, Bot, PlayCircle } from "lucide-react";

const courses = [
  {
    id: "c1",
    title: "Introdução à Programação",
    description: "Aprenda os fundamentos da programação com Python. Do zero ao primeiro projeto.",
    aiPersona: "Professor Python",
    lessons: 12,
    duration: "24 horas",
    students: 156,
    progress: 75,
  },
  {
    id: "c2",
    title: "Banco de Dados",
    description: "Modelagem de dados, SQL e sistemas gerenciadores de banco de dados.",
    aiPersona: "Professor SQL",
    lessons: 10,
    duration: "18 horas",
    students: 89,
    progress: 45,
  },
  {
    id: "c3",
    title: "Redes de Computadores",
    description: "Fundamentos de redes, protocolos e arquitetura de sistemas distribuídos.",
    aiPersona: "Professor Networks",
    lessons: 8,
    duration: "16 horas",
    students: 72,
    progress: 20,
  },
];

const colors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
];

export default function CursosPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Meus Cursos" subtitle="Gerencie seus cursos e acompanhe seu progresso" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              href={`/aluno/cursos/${course.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className={`h-32 bg-gradient-to-br ${colors[index % colors.length]} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="text-white/30" size={64} />
                </div>
                <div className="absolute bottom-3 right-3">
                  <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    {course.progress}% concluído
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <Bot size={16} className="text-blue-500" />
                  <span>{course.aiPersona}</span>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <PlayCircle size={14} />
                    <span>{course.lessons} aulas</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{course.students}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
