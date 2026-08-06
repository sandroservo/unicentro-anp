// prisma/seed.ts — UNICENTROMA: turmas de Enfermagem, Direito e Administração
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PERMISSIONS, ROLES, toRoleSlug } from "../lib/rbac";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoId: string;
  duration: number;
  order: number;
};

type ModuleSeed = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonSeed[];
};

type SubjectSeed = {
  id: string;
  title: string;
  code: string;
  order: number;
  modules: ModuleSeed[];
};

type TurmaSeed = {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  workloadHours: number;
  aiPersona: string;
  aiContext: string;
  subjects: SubjectSeed[];
};

const TURMAS: TurmaSeed[] = [
  {
    id: "turma-enf",
    title: "Enfermagem — Turma 2026.1",
    slug: "enfermagem-2026-1",
    code: "ENF-2026.1",
    description:
      "Turma do curso de Enfermagem. Formação para cuidados clínicos, atenção básica e ética profissional.",
    workloadHours: 320,
    aiPersona: "Professora Ana — enfermeira e docente, explica procedimentos com segurança e empatia",
    aiContext:
      "Curso de Enfermagem. Foque em anatomia, fundamentos de enfermagem, biossegurança e ética no cuidado ao paciente.",
    subjects: [
      {
        id: "mat-enf-anat",
        title: "Anatomia e Fisiologia",
        code: "ENF-101",
        order: 1,
        modules: [
          {
            id: "mod-enf-anat-1",
            title: "Módulo 1 — Sistemas do corpo",
            description: "Visão geral dos sistemas humanos",
            order: 1,
            lessons: [
              {
                id: "aula-enf-1",
                title: "Introdução à anatomia humana",
                description: "Planos, eixos e nomenclatura anatômica",
                videoUrl: "https://www.youtube.com/watch?v=0FwcLQK4NXE",
                videoId: "0FwcLQK4NXE",
                duration: 1200,
                order: 1,
              },
              {
                id: "aula-enf-2",
                title: "Sistema cardiovascular",
                description: "Coração, vasos e circulação",
                videoUrl: "https://www.youtube.com/watch?v=CWFyxn0qDEU",
                videoId: "CWFyxn0qDEU",
                duration: 1500,
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: "mat-enf-fund",
        title: "Fundamentos de Enfermagem",
        code: "ENF-102",
        order: 2,
        modules: [
          {
            id: "mod-enf-fund-1",
            title: "Módulo 1 — Cuidado e biossegurança",
            description: "Princípios do cuidado de enfermagem",
            order: 1,
            lessons: [
              {
                id: "aula-enf-3",
                title: "Higiene das mãos e EPI",
                description: "Protocolos de biossegurança no ambiente hospitalar",
                videoUrl: "https://www.youtube.com/watch?v=3PmVJQUCm4E",
                videoId: "3PmVJQUCm4E",
                duration: 900,
                order: 1,
              },
              {
                id: "aula-enf-4",
                title: "Sinais vitais",
                description: "Mensuração e interpretação de sinais vitais",
                videoUrl: "https://www.youtube.com/watch?v=gVu9l1fQq8E",
                videoId: "gVu9l1fQq8E",
                duration: 1100,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "turma-dir",
    title: "Direito — Turma 2026.1",
    slug: "direito-2026-1",
    code: "DIR-2026.1",
    description:
      "Turma do curso de Direito. Introdução ao ordenamento jurídico brasileiro e bases constitucionais.",
    workloadHours: 360,
    aiPersona: "Professor Ricardo — advogado e professor, explica Direito com exemplos práticos",
    aiContext:
      "Curso de Direito. Foque em introdução ao Direito, Constituição Federal e raciocínio jurídico.",
    subjects: [
      {
        id: "mat-dir-intro",
        title: "Introdução ao Direito",
        code: "DIR-101",
        order: 1,
        modules: [
          {
            id: "mod-dir-intro-1",
            title: "Módulo 1 — Noções gerais",
            description: "Conceitos fundamentais",
            order: 1,
            lessons: [
              {
                id: "aula-dir-1",
                title: "O que é Direito?",
                description: "Conceito, funções e ramos do Direito",
                videoUrl: "https://www.youtube.com/watch?v=8jPQjjsBbAc",
                videoId: "8jPQjjsBbAc",
                duration: 1400,
                order: 1,
              },
              {
                id: "aula-dir-2",
                title: "Fontes do Direito",
                description: "Lei, doutrina, jurisprudência e costumes",
                videoUrl: "https://www.youtube.com/watch?v=YqQZ8xJvJzA",
                videoId: "YqQZ8xJvJzA",
                duration: 1300,
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: "mat-dir-const",
        title: "Direito Constitucional",
        code: "DIR-102",
        order: 2,
        modules: [
          {
            id: "mod-dir-const-1",
            title: "Módulo 1 — Constituição",
            description: "Estrutura da CF/88",
            order: 1,
            lessons: [
              {
                id: "aula-dir-3",
                title: "Princípios fundamentais da CF/88",
                description: "Artigos 1º a 4º da Constituição",
                videoUrl: "https://www.youtube.com/watch?v=pTQ9i4i8x0E",
                videoId: "pTQ9i4i8x0E",
                duration: 1600,
                order: 1,
              },
              {
                id: "aula-dir-4",
                title: "Direitos e garantias fundamentais",
                description: "Art. 5º — direitos individuais e coletivos",
                videoUrl: "https://www.youtube.com/watch?v=kP5n8qYvJcE",
                videoId: "kP5n8qYvJcE",
                duration: 1800,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "turma-adm",
    title: "Administração — Turma 2026.1",
    slug: "administracao-2026-1",
    code: "ADM-2026.1",
    description:
      "Turma do curso de Administração. Gestão organizacional, pessoas e planejamento estratégico.",
    workloadHours: 300,
    aiPersona: "Professora Camila — administradora e consultora, conecta teoria à prática empresarial",
    aiContext:
      "Curso de Administração. Foque em funções administrativas, gestão de pessoas e planejamento.",
    subjects: [
      {
        id: "mat-adm-intro",
        title: "Introdução à Administração",
        code: "ADM-101",
        order: 1,
        modules: [
          {
            id: "mod-adm-intro-1",
            title: "Módulo 1 — Funções administrativas",
            description: "Planejar, organizar, dirigir e controlar",
            order: 1,
            lessons: [
              {
                id: "aula-adm-1",
                title: "O que é Administração?",
                description: "Conceitos e evolução do pensamento administrativo",
                videoUrl: "https://www.youtube.com/watch?v=sZ2qulI6GEk",
                videoId: "sZ2qulI6GEk",
                duration: 1200,
                order: 1,
              },
              {
                id: "aula-adm-2",
                title: "As 4 funções da Administração",
                description: "PODC na prática organizacional",
                videoUrl: "https://www.youtube.com/watch?v=sZ2qulI6GEk",
                videoId: "sZ2qulI6GEk",
                duration: 1000,
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: "mat-adm-gp",
        title: "Gestão de Pessoas",
        code: "ADM-102",
        order: 2,
        modules: [
          {
            id: "mod-adm-gp-1",
            title: "Módulo 1 — Pessoas e organizações",
            description: "RH estratégico",
            order: 1,
            lessons: [
              {
                id: "aula-adm-3",
                title: "Recrutamento e seleção",
                description: "Processos de atração e escolha de talentos",
                videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
                videoId: "9bZkp7q19f0",
                duration: 1100,
                order: 1,
              },
              {
                id: "aula-adm-4",
                title: "Motivação e clima organizacional",
                description: "Teorias motivacionais aplicadas",
                videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
                videoId: "fJ9rUzIMcZQ",
                duration: 1250,
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
];

async function seedTurma(turma: TurmaSeed) {
  const course = await prisma.course.upsert({
    where: { id: turma.id },
    update: {
      title: turma.title,
      description: turma.description,
      slug: turma.slug,
      code: turma.code,
      workloadHours: turma.workloadHours,
      isActive: true,
      aiPersona: turma.aiPersona,
      aiContext: turma.aiContext,
    },
    create: {
      id: turma.id,
      title: turma.title,
      description: turma.description,
      slug: turma.slug,
      code: turma.code,
      workloadHours: turma.workloadHours,
      isActive: true,
      aiPersona: turma.aiPersona,
      aiContext: turma.aiContext,
    },
  });

  for (const sub of turma.subjects) {
    await prisma.subject.upsert({
      where: { id: sub.id },
      update: {
        title: sub.title,
        code: sub.code,
        order: sub.order,
        courseId: course.id,
      },
      create: {
        id: sub.id,
        courseId: course.id,
        title: sub.title,
        code: sub.code,
        order: sub.order,
      },
    });

    for (const mod of sub.modules) {
      await prisma.module.upsert({
        where: { id: mod.id },
        update: {
          title: mod.title,
          description: mod.description,
          order: mod.order,
          courseId: course.id,
          subjectId: sub.id,
        },
        create: {
          id: mod.id,
          courseId: course.id,
          subjectId: sub.id,
          title: mod.title,
          description: mod.description,
          order: mod.order,
        },
      });

      for (const lesson of mod.lessons) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            videoId: lesson.videoId,
            duration: lesson.duration,
            order: lesson.order,
            moduleId: mod.id,
          },
          create: {
            id: lesson.id,
            moduleId: mod.id,
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            videoId: lesson.videoId,
            duration: lesson.duration,
            order: lesson.order,
          },
        });
      }
    }
  }

  return course;
}

async function ensureStudent(opts: {
  email: string;
  name: string;
  matricula: string;
  password: string;
  roleId: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: {
      name: opts.name,
      role: "ALUNO",
      roleId: opts.roleId,
    },
    create: {
      email: opts.email,
      name: opts.name,
      password: opts.password,
      role: "ALUNO",
      roleId: opts.roleId,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: { matricula: opts.matricula, status: "ATIVO" },
    create: {
      userId: user.id,
      matricula: opts.matricula,
      status: "ATIVO",
    },
  });

  return user;
}

async function enrollInTurma(userId: string, courseId: string, progress = 0) {
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { progress },
    create: { userId, courseId, role: "STUDENT", progress },
  });
}

async function linkToSubject(userId: string, subjectId: string) {
  await prisma.subjectEnrollment.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    update: {},
    create: { userId, subjectId },
  });
}

async function main() {
  console.log("🌱 Seed UNICENTROMA — Enfermagem, Direito e Administração...");

  const hashedPassword = await hash("123456", 12);

  // RBAC
  const permIds = new Map<string, string>();
  for (const slug of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
    permIds.set(slug, p.id);
  }

  const roleIdBySlug = new Map<string, string>();
  for (const def of ROLES) {
    const r = await prisma.role.upsert({
      where: { slug: def.slug },
      update: { name: def.name },
      create: { slug: def.slug, name: def.name },
    });
    roleIdBySlug.set(def.slug, r.id);
    await prisma.rolePermission.deleteMany({ where: { roleId: r.id } });
    if (def.permissions.length) {
      await prisma.rolePermission.createMany({
        data: def.permissions.map((perm) => ({
          roleId: r.id,
          permissionId: permIds.get(perm)!,
        })),
        skipDuplicates: true,
      });
    }
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@anp.com" },
    update: {
      name: "Carlos Admin",
      role: "ADMIN",
      roleId: roleIdBySlug.get("ADMINISTRADOR")!,
    },
    create: {
      email: "admin@anp.com",
      name: "Carlos Admin",
      password: hashedPassword,
      role: "ADMIN",
      roleId: roleIdBySlug.get("ADMINISTRADOR")!,
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "professor@anp.com" },
    update: {
      name: "Maria Santos",
      role: "TEACHER",
      roleId: roleIdBySlug.get("PROFESSOR")!,
    },
    create: {
      email: "professor@anp.com",
      name: "Maria Santos",
      password: hashedPassword,
      role: "TEACHER",
      roleId: roleIdBySlug.get("PROFESSOR")!,
    },
  });

  const alunoRoleId = roleIdBySlug.get("ALUNO")!;

  const alunoEnf = await ensureStudent({
    email: "aluno@anp.com",
    name: "João Silva",
    matricula: "ENF2026001",
    password: hashedPassword,
    roleId: alunoRoleId,
  });

  const alunoDir = await ensureStudent({
    email: "aluno.direito@anp.com",
    name: "Ana Oliveira",
    matricula: "DIR2026001",
    password: hashedPassword,
    roleId: alunoRoleId,
  });

  const alunoAdm = await ensureStudent({
    email: "aluno.adm@anp.com",
    name: "Pedro Costa",
    matricula: "ADM2026001",
    password: hashedPassword,
    roleId: alunoRoleId,
  });

  // Backfill roles
  for (const u of await prisma.user.findMany({ select: { id: true, role: true } })) {
    await prisma.user.update({
      where: { id: u.id },
      data: { roleId: roleIdBySlug.get(toRoleSlug(u.role))! },
    });
  }

  console.log("✅ Usuários e RBAC");

  for (const turma of TURMAS) {
    await seedTurma(turma);
  }
  console.log("✅ Turmas: Enfermagem, Direito e Administração");

  // Vínculos de exemplo
  // João (Enfermagem): turma + as 2 matérias
  await enrollInTurma(alunoEnf.id, "turma-enf", 25);
  await linkToSubject(alunoEnf.id, "mat-enf-anat");
  await linkToSubject(alunoEnf.id, "mat-enf-fund");

  // Ana (Direito): turma + Introdução ao Direito (não Constitucional ainda)
  await enrollInTurma(alunoDir.id, "turma-dir", 10);
  await linkToSubject(alunoDir.id, "mat-dir-intro");

  // Pedro (Administração): turma + as 2 matérias
  await enrollInTurma(alunoAdm.id, "turma-adm", 0);
  await linkToSubject(alunoAdm.id, "mat-adm-intro");
  await linkToSubject(alunoAdm.id, "mat-adm-gp");

  // João também experimenta uma matéria de Administração (cenário multi-turma)
  await enrollInTurma(alunoEnf.id, "turma-adm", 0);
  await linkToSubject(alunoEnf.id, "mat-adm-intro");

  // Progresso de João em Enfermagem
  for (const lessonId of ["aula-enf-1", "aula-enf-2"]) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: alunoEnf.id, lessonId } },
      update: { completed: true, videoProgress: 100 },
      create: {
        userId: alunoEnf.id,
        lessonId,
        completed: true,
        videoProgress: 100,
        timeSpent: 900,
      },
    });
  }

  console.log("✅ Matrículas, vínculos de matérias e progresso");
  console.log("\n🎉 Seed concluído!\n");
  console.log("📋 Credenciais:");
  console.log("   Admin:            admin@anp.com / 123456");
  console.log("   Professor:        professor@anp.com / 123456");
  console.log("   Aluno Enfermagem: aluno@anp.com / 123456");
  console.log("   Aluna Direito:    aluno.direito@anp.com / 123456");
  console.log("   Aluno Adm:        aluno.adm@anp.com / 123456");
  console.log("\n🏫 Turmas: Enfermagem, Direito, Administração (2026.1)");
  void admin;
  void professor;
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
