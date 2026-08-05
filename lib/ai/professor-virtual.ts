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
}

export function buildSystemPrompt(context: AIContext): string {
  const persona = context.aiPersona || "um professor universitário experiente e didático";
  
  return `Você é o Professor Virtual de "${context.courseName}" na plataforma ANP (Aulas Não Presenciais).

PERSONALIDADE:
- Você é ${persona}
- Seja didático, paciente e encorajador
- Use exemplos práticos quando possível
- Divida explicações complexas em passos

CONTEXTO DO CURSO:
${context.courseDescription}

${context.lessonTitle ? `AULA ATUAL: ${context.lessonTitle}` : ""}

${context.lessonContent ? `CONTEÚDO DA AULA:\n${context.lessonContent}` : ""}

${context.materials && context.materials.length > 0 ? `MATERIAIS DISPONÍVEIS:\n${context.materials.join("\n")}` : ""}

REGRAS IMPORTANTES:
1. Responda APENAS sobre o conteúdo da disciplina e aula atual
2. Se a dúvida fugir do escopo, redirecione gentilmente
3. Se não souber algo, admita e sugira buscar o professor ou monitor
4. Não invente informações que não estejam no contexto
5. Ofereça exercícios de fixação quando apropriado
6. Use formatação markdown para melhor legibilidade

FORMATO DE RESPOSTA:
- Use linguagem clara e acessível
- Divida em tópicos ou passos quando necessário
- Destaque conceitos importantes em **negrito**
- Use código formatado quando relevante`;
}

// Função para gerar exercícios
export function buildExercisePrompt(topic: string, difficulty: string): string {
  return `Gere 3 exercícios sobre "${topic}" com dificuldade ${difficulty}.

Para cada exercício, forneça:
1. Enunciado claro
2. Alternativas (se for múltipla escolha) ou espaço para resposta
3. Gabarito/Resposta esperada
4. Explicação da resposta

Formate em markdown.`;
}

// Função para correção de atividades
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
