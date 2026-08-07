import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import {
  buildSystemPrompt,
  type AIContext,
} from "@/lib/ai/professor-virtual";
import { chatCompletion, type ChatMessage } from "@/lib/ai/openrouter";
import { parseBody, apiError, ApiError } from "@/lib/api";

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .min(1, "Mensagens são obrigatórias"),
  context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return apiError("Não autorizado", 401);

    const { messages, context } = await parseBody(chatSchema, request);

    const ctx = context as Partial<AIContext> | undefined;
    const aiContext: AIContext = {
      courseName: ctx?.courseName || "Curso",
      courseDescription: ctx?.courseDescription || "",
      lessonTitle: ctx?.lessonTitle,
      lessonContent: ctx?.lessonContent,
      materials: ctx?.materials,
      aiPersona: ctx?.aiPersona,
    };
    const systemPrompt = buildSystemPrompt(aiContext);
    const lastQuestion = messages[messages.length - 1]?.content || "";

    // Motor: OmniRoute (gateway OpenAI-compatible). NO_API_KEY / erro → resposta simulada.
    try {
      const gwMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...(messages as ChatMessage[]),
      ];
      const response = await chatCompletion(gwMessages, 0.5);
      return NextResponse.json({ response });
    } catch (e: any) {
      if (!(e instanceof Error && e.message === "NO_API_KEY")) {
        console.warn("OmniRoute indisponível, usando resposta simulada:", e?.message);
      }
      return NextResponse.json({
        response: getSimulatedResponse(lastQuestion),
        simulated: true,
      });
    }
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro no chat IA:", error);
    return apiError("Erro interno do servidor", 500);
  }
}

// Respostas simuladas quando não há API key
function getSimulatedResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("função") || q.includes("def")) {
    return `Funções em Python são blocos de código reutilizáveis. Para criar uma função, use a palavra-chave \`def\`:

\`\`\`python
def saudacao(nome):
    return f"Olá, {nome}!"

# Chamando a função
mensagem = saudacao("Maria")
print(mensagem)  # Olá, Maria!
\`\`\`

**Pontos importantes:**
- Use nomes descritivos para suas funções
- Funções podem ter parâmetros (valores de entrada)
- Use \`return\` para devolver valores

Posso ajudar com mais alguma coisa sobre funções?`;
  }

  if (q.includes("variável") || q.includes("tipo")) {
    return `Em Python, variáveis são criadas automaticamente quando você atribui um valor:

\`\`\`python
# Tipos básicos
nome = "Maria"      # string (texto)
idade = 25          # int (número inteiro)
altura = 1.75       # float (número decimal)
ativo = True        # bool (verdadeiro/falso)
\`\`\`

Python é uma linguagem **dinamicamente tipada**, então você não precisa declarar o tipo da variável.

Quer que eu explique mais sobre algum tipo específico?`;
  }

  if (q.includes("lista") || q.includes("array")) {
    return `Listas em Python são coleções ordenadas e mutáveis:

\`\`\`python
# Criando uma lista
frutas = ["maçã", "banana", "laranja"]

# Acessando elementos
print(frutas[0])  # maçã

# Adicionando elementos
frutas.append("uva")

# Removendo elementos
frutas.remove("banana")

# Iterando
for fruta in frutas:
    print(fruta)
\`\`\`

**Métodos úteis:**
- \`append()\` - adiciona no final
- \`insert()\` - adiciona em posição específica
- \`remove()\` - remove por valor
- \`pop()\` - remove por índice

Tem alguma dúvida específica sobre listas?`;
  }

  return `Obrigado pela sua pergunta! 

Como Professor Virtual, estou aqui para ajudar com o conteúdo do curso. Posso explicar conceitos como:

📚 **Temas que posso ajudar:**
- Variáveis e tipos de dados
- Estruturas de controle (if, for, while)
- Funções
- Listas, tuplas e dicionários
- Orientação a objetos

Por favor, me diga especificamente sobre qual tema você gostaria de aprender ou qual dúvida você tem sobre a aula atual.

*Nota: Esta é uma resposta simulada. Configure o OmniRoute em Admin → Configurações (ou OMNIROUTE_* no .env) para respostas reais.*`;
}
