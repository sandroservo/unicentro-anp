// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar usuários de demonstração
  const hashedPassword = await hash("123456", 12);

  const aluno = await prisma.user.upsert({
    where: { email: "aluno@anp.com" },
    update: {},
    create: {
      email: "aluno@anp.com",
      name: "João Silva",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "professor@anp.com" },
    update: {},
    create: {
      email: "professor@anp.com",
      name: "Maria Santos",
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@anp.com" },
    update: {},
    create: {
      email: "admin@anp.com",
      name: "Carlos Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuários criados");

  // Criar curso de Programação
  const cursoProgramacao = await prisma.course.upsert({
    where: { id: "c1" },
    update: {},
    create: {
      id: "c1",
      title: "Introdução à Programação",
      description:
        "Aprenda os fundamentos da programação com Python. Este curso abrange desde conceitos básicos até a criação do seu primeiro projeto completo.",
      aiPersona: "Professor Python - especialista em ensinar programação para iniciantes de forma didática e prática",
      aiContext: `Este é um curso introdutório de programação usando Python.
      
Tópicos abordados:
- Variáveis e tipos de dados
- Operadores e expressões
- Estruturas de controle (if, for, while)
- Funções
- Listas, tuplas e dicionários
- Programação orientada a objetos básica

O aluno deve aprender a lógica de programação e ser capaz de criar programas simples ao final do curso.`,
    },
  });

  // Criar módulos do curso
  const modulo1 = await prisma.module.upsert({
    where: { id: "m1" },
    update: {},
    create: {
      id: "m1",
      courseId: cursoProgramacao.id,
      title: "Módulo 1: Fundamentos",
      description: "Conceitos básicos de programação",
      order: 1,
    },
  });

  const modulo2 = await prisma.module.upsert({
    where: { id: "m2" },
    update: {},
    create: {
      id: "m2",
      courseId: cursoProgramacao.id,
      title: "Módulo 2: Estruturas de Dados",
      description: "Listas, tuplas e dicionários",
      order: 2,
    },
  });

  console.log("✅ Curso e módulos criados");

  // Criar aulas
  const aulas = [
    {
      id: "l1",
      moduleId: modulo1.id,
      title: "Introdução ao Python",
      description: "Conhecendo a linguagem Python e seu ambiente",
      videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
      videoId: "rfscVS0vtbw",
      duration: 900,
      order: 1,
    },
    {
      id: "l2",
      moduleId: modulo1.id,
      title: "Variáveis e Tipos de Dados",
      description: "Entendendo variáveis, strings, números e booleanos",
      videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
      videoId: "kqtD5dpn9C8",
      duration: 1200,
      order: 2,
    },
    {
      id: "l3",
      moduleId: modulo1.id,
      title: "Operadores",
      description: "Operadores aritméticos, lógicos e de comparação",
      videoUrl: "https://www.youtube.com/watch?v=v5MR5JnKcZI",
      videoId: "v5MR5JnKcZI",
      duration: 1080,
      order: 3,
    },
    {
      id: "l4",
      moduleId: modulo1.id,
      title: "Estruturas de Controle",
      description: "if, elif, else e loops",
      videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
      videoId: "Zp5MuPOtsSY",
      duration: 1500,
      order: 4,
    },
    {
      id: "l5",
      moduleId: modulo2.id,
      title: "Listas",
      description: "Criando e manipulando listas em Python",
      videoUrl: "https://www.youtube.com/watch?v=ohCDWZgNIU0",
      videoId: "ohCDWZgNIU0",
      duration: 1320,
      order: 1,
    },
    {
      id: "l6",
      moduleId: modulo2.id,
      title: "Dicionários",
      description: "Trabalhando com pares chave-valor",
      videoUrl: "https://www.youtube.com/watch?v=daefaLgNkw0",
      videoId: "daefaLgNkw0",
      duration: 1200,
      order: 2,
    },
    {
      id: "l7",
      moduleId: modulo2.id,
      title: "Funções",
      description: "Criando funções reutilizáveis",
      videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
      videoId: "9Os0o3wzS_I",
      duration: 1800,
      order: 3,
    },
  ];

  for (const aula of aulas) {
    await prisma.lesson.upsert({
      where: { id: aula.id },
      update: {},
      create: aula,
    });
  }

  console.log("✅ Aulas criadas");

  // Matricular aluno no curso
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: aluno.id,
        courseId: cursoProgramacao.id,
      },
    },
    update: {},
    create: {
      userId: aluno.id,
      courseId: cursoProgramacao.id,
      role: "STUDENT",
      progress: 42.85, // 3 de 7 aulas
    },
  });

  // Criar progresso em algumas aulas
  const progressData = [
    { lessonId: "l1", completed: true, videoProgress: 100 },
    { lessonId: "l2", completed: true, videoProgress: 100 },
    { lessonId: "l3", completed: true, videoProgress: 100 },
    { lessonId: "l4", completed: false, videoProgress: 65 },
  ];

  for (const p of progressData) {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: aluno.id,
          lessonId: p.lessonId,
        },
      },
      update: {},
      create: {
        userId: aluno.id,
        lessonId: p.lessonId,
        completed: p.completed,
        videoProgress: p.videoProgress,
        timeSpent: Math.floor(Math.random() * 3600),
      },
    });
  }

  console.log("✅ Matrículas e progresso criados");

  // Criar segundo curso (Banco de Dados)
  const cursoBD = await prisma.course.upsert({
    where: { id: "c2" },
    update: {},
    create: {
      id: "c2",
      title: "Banco de Dados",
      description:
        "Aprenda modelagem de dados, SQL e sistemas gerenciadores de banco de dados.",
      aiPersona: "Professor SQL - especialista em bancos de dados relacionais",
      aiContext: `Curso de introdução a bancos de dados.
      
Tópicos:
- Modelagem de dados
- Modelo Entidade-Relacionamento
- SQL básico e avançado
- Normalização
- Índices e otimização`,
    },
  });

  // Matricular aluno no curso de BD também
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: aluno.id,
        courseId: cursoBD.id,
      },
    },
    update: {},
    create: {
      userId: aluno.id,
      courseId: cursoBD.id,
      role: "STUDENT",
      progress: 0,
    },
  });

  console.log("✅ Segundo curso criado");

  console.log("🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de teste:");
  console.log("   Aluno: aluno@anp.com / 123456");
  console.log("   Professor: professor@anp.com / 123456");
  console.log("   Admin: admin@anp.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
