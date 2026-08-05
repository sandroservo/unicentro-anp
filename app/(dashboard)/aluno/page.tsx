import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Users,
  Play,
  ChevronRight,
  Bot,
  ClipboardList,
  FileText,
  MessageSquare,
} from "lucide-react";

async function getStudentData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  const progress = await prisma.progress.findMany({
    where: { userId },
  });

  return { enrollments, progress };
}

export default async function AlunoDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  let enrollments: any[] = [];
  let totalLessons = 0;
  let completedLessons = 0;

  if (userId) {
    try {
      const data = await getStudentData(userId);
      enrollments = data.enrollments;
      
      // Calcular estatísticas
      data.enrollments.forEach((enrollment) => {
        enrollment.course.modules.forEach((module: any) => {
          totalLessons += module.lessons.length;
        });
      });
      
      completedLessons = data.progress.filter((p) => p.completed).length;
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  }

  // Dados mockados para demonstração se não houver dados reais
  const mockCourses = enrollments.length > 0 ? enrollments : [
    {
      id: "1",
      progress: 75,
      course: {
        id: "c1",
        title: "Introdução à Programação",
        description: "Aprenda os fundamentos da programação com Python",
        aiPersona: "Prof. Virtual Python",
      },
    },
    {
      id: "2",
      progress: 45,
      course: {
        id: "c2",
        title: "Banco de Dados",
        description: "Modelagem e SQL para iniciantes",
        aiPersona: "Prof. Virtual SQL",
      },
    },
    {
      id: "3",
      progress: 20,
      course: {
        id: "c3",
        title: "Redes de Computadores",
        description: "Fundamentos de redes e protocolos",
        aiPersona: "Prof. Virtual Networks",
      },
    },
  ];

  const mockActivities = [
    {
      id: "1",
      title: "Quiz: Estruturas de Dados",
      course: "Introdução à Programação",
      deadline: "2 dias",
      type: "quiz",
    },
    {
      id: "2",
      title: "Trabalho: Modelagem ER",
      course: "Banco de Dados",
      deadline: "5 dias",
      type: "trabalho",
    },
    {
      id: "3",
      title: "Fórum: Protocolos TCP/IP",
      course: "Redes de Computadores",
      deadline: "1 semana",
      type: "forum",
    },
  ];

  const stats = [
    {
      label: "Cursos Ativos",
      value: mockCourses.length.toString(),
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "Horas de Estudo",
      value: "24h",
      icon: Clock,
      color: "green",
    },
    {
      label: "Aulas Completas",
      value: `${completedLessons}/${totalLessons || 18}`,
      icon: CheckCircle2,
      color: "purple",
    },
    {
      label: "Participações",
      value: "8",
      icon: Users,
      color: "orange",
    },
  ];

  const colors = [
    "from-primary/100 to-primary",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
  ];

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="flex-1 p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}
                >
                  <stat.icon className={`text-${stat.color}-500`} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cursos */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Meus Cursos</h2>
                <Link
                  href="/aluno/cursos"
                  className="text-sm text-primary hover:text-primary"
                >
                  Ver todos
                </Link>
              </div>
              <div className="divide-y divide-border">
                {mockCourses.map((enrollment, index) => (
                  <Link
                    key={enrollment.id}
                    href={`/aluno/cursos/${enrollment.course.id}`}
                    className="block p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white`}
                      >
                        <BookOpen size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {enrollment.course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Bot size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {enrollment.course.aiPersona || "Professor Virtual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {enrollment.progress}%
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all`}
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Continuar Assistindo */}
            <div className="mt-6 bg-gradient-to-br from-primary/100 to-primary rounded-xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-foreground text-sm">Continuar assistindo</p>
                  <h3 className="text-xl font-semibold mt-1">
                    Aula 8: Funções em Python
                  </h3>
                  <p className="text-primary-foreground text-sm mt-2">
                    Introdução à Programação • 45min restantes
                  </p>
                </div>
                <Link
                  href="/aluno/cursos/c1/aulas/1"
                  className="w-14 h-14 bg-card/20 rounded-full flex items-center justify-center hover:bg-card/30 transition-colors"
                >
                  <Play size={28} className="text-white ml-1" />
                </Link>
              </div>
              <div className="mt-4">
                <div className="h-1 bg-card/20 rounded-full">
                  <div className="h-full w-3/5 bg-card rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Próximas Atividades */}
          <div className="bg-card rounded-xl border border-border overflow-hidden h-fit">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Próximas Atividades</h2>
            </div>
            <div className="divide-y divide-border">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === "quiz"
                          ? "bg-purple-50 text-purple-500"
                          : activity.type === "trabalho"
                          ? "bg-orange-50 text-orange-500"
                          : "bg-primary/10 text-green-500"
                      }`}
                    >
                      {activity.type === "quiz" && <ClipboardList size={20} />}
                      {activity.type === "trabalho" && <FileText size={20} />}
                      {activity.type === "forum" && <MessageSquare size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.course}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Prazo: {activity.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Link
                href="/aluno/atividades"
                className="block w-full py-2 text-sm text-primary hover:text-primary font-medium text-center"
              >
                Ver todas as atividades
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
