import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildSystemPrompt,
  type AIMessage,
  type AIContext,
} from "@/lib/ai/professor-virtual";
import { callChatAPI, getActiveProvider } from "@/lib/ai/providers";
import { getAISettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Mensagens são obrigatórias" },
        { status: 400 }
      );
    }

    const aiSettings = await getAISettings();
    const activeProvider = getActiveProvider(aiSettings);

    if (!activeProvider) {
      return NextResponse.json({
        response: getSimulatedResponse(messages[messages.length - 1]?.content || ""),
        simulated: true,
      });
    }

    const aiContext: AIContext = {
      courseName: context?.courseName || "Curso",
      courseDescription: context?.courseDescription || "",
      lessonTitle: context?.lessonTitle,
      lessonContent: context?.lessonContent,
      materials: context?.materials,
      aiPersona: context?.aiPersona,
    };

    const systemPrompt = buildSystemPrompt(aiContext);

    try {
      const response = await callChatAPI(
        messages as AIMessage[],
        systemPrompt,
        aiSettings
      );
      return NextResponse.json({ response });
    } catch (apiError: any) {
      console.warn(`API ${activeProvider.provider} indisponível, usando resposta simulada:`, apiError?.message);
      return NextResponse.json({
        response: getSimulatedResponse(messages[messages.length - 1]?.content || ""),
        simulated: true,
      });
    }
  } catch (error: any) {
    console.error("Erro no chat IA:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
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

*Nota: Esta é uma resposta simulada. Configure AI_PROVIDER e uma chave (ANTHROPIC_API_KEY ou OPENAI_API_KEY) no .env para respostas reais.*`;
}
