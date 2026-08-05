import Link from "next/link";
import {
  Users, BookOpen, ClipboardList, Award, Settings, ChevronRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardBarChart } from "@/components/dashboard/bar-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const quickLinks = [
  { href: "/admin/alunos", label: "Alunos", icon: Users, desc: "Gestão de alunos" },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen, desc: "Cursos, disciplinas e aulas" },
  { href: "/admin/questoes", label: "Banco de Questões", icon: ClipboardList, desc: "Pool de questões" },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, desc: "IA, chaves e modelos" },
];

export default async function AdminDashboard() {
  const [students, courses, subjects, lessons, activities, submissions, certificates, topCourses] =
    await Promise.all([
      prisma.studentProfile.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.subject.count(),
      prisma.lesson.count(),
      prisma.activity.count(),
      prisma.submission.count(),
      prisma.certificate.count(),
      prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, title: true, _count: { select: { modules: true, enrollments: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);


  return (
    <>
      <Header title="Painel Administrativo" subtitle="Visão geral da plataforma" />
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Alunos" value={students} icon={Users} />
          <StatCard label="Cursos ativos" value={courses} icon={BookOpen} hint={`${subjects} disciplinas · ${lessons} aulas`} />
          <StatCard label="Atividades" value={activities} icon={ClipboardList} hint={`${submissions} submissões`} />
          <StatCard label="Certificados" value={certificates} icon={Award} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cursos: módulos por curso (ApexCharts) */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Módulos por curso</CardTitle></CardHeader>
            <CardContent>
              {topCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum curso ativo.</p>
              ) : (
                <DashboardBarChart
                  label="Módulos"
                  categories={topCourses.map((c) => (c.title.length > 16 ? c.title.slice(0, 15) + "…" : c.title))}
                  data={topCourses.map((c) => c._count.modules)}
                />
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader><CardTitle>Acesso rápido</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
                    <l.icon className="h-4 w-4 text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{l.label}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{l.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
