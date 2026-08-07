// lib/ai/professor-virtual.ts

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIContext {
  courseName: string;
  courseDescription: string;
  lessonTitle?: string;
  lessonContent?: string;
  materials?: string[];
  aiPersona?: string;
  subjectTitle?: string;
}

export function buildSystemPrompt(context: AIContext): string {
  const persona =
    context.aiPersona || "um professor universitário experiente e didático";

  const lessonBlock = [
    context.subjectTitle ? `MATÉRIA: ${context.subjectTitle}` : "",
    context.lessonTitle ? `AULA ATUAL: ${context.lessonTitle}` : "",
    context.lessonContent
      ? `CONTEÚDO / CONCEITO DA AULA:\n${context.lessonContent}`
      : "",
    context.materials && context.materials.length > 0
      ? `MATERIAIS DISPONÍVEIS:\n${context.materials.join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Você é o Professor Virtual de "${context.courseName}" na plataforma ANP (Aulas Não Presenciais) da UNICENTROMA.

PERSONALIDADE:
- Você é ${persona}
- Seja didático, paciente e encorajador
- Use exemplos práticos quando possível
- Divida explicações complexas em passos
- Responda em português do Brasil

CONTEXTO DO CURSO / TURMA:
${context.courseDescription || "(sem descrição cadastrada)"}

${lessonBlock}

REGRAS IMPORTANTES:
1. Priorize o conteúdo da disciplina, aula atual e material recuperado (RAG)
2. Se a dúvida fugir do escopo, redirecione gentilmente para o tema da turma
3. Se não souber algo, admita e sugira buscar o professor ou monitor
4. Não invente fatos que não estejam no contexto; quando usar conhecimento geral, avise
5. Ofereça um mini-exercício de fixação quando ajudar o aluno
6. Use markdown leve (listas, **negrito**, código) para legibilidade

FORMATO DE RESPOSTA:
- Linguagem clara e acessível
- Comece pela resposta direta; depois detalhe se necessário
- Destaque conceitos importantes em **negrito**`;
}

export function buildExercisePrompt(topic: string, difficulty: string): string {
  return `Gere 3 exercícios sobre "${topic}" com dificuldade ${difficulty}.

Para cada exercício, forneça:
1. Enunciado claro
2. Alternativas (se for múltipla escolha) ou espaço para resposta
3. Gabarito/Resposta esperada
4. Explicação da resposta

Formate em markdown.`;
}

export function buildGradingPrompt(
  question: string,
  answer: string,
  criteria: string
): string {
  return `Avalie a seguinte resposta:

QUESTÃO: ${question}

RESPOSTA DO ALUNO: ${answer}

CRITÉRIOS DE AVALIAÇÃO: ${criteria}

Forneça:
1. Nota de 0 a 10
2. Feedback construtivo
3. Pontos fortes
4. Sugestões de melhoria

Seja encorajador mas honesto na avaliação.`;
}
