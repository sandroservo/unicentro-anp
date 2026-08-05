import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { retrieveContext, augmentSystemPrompt } from "@/lib/rag";
import { chatCompletion, type ChatMessage } from "@/lib/ai/openrouter";

const schema = z.object({
  message: z.string().trim().min(1, "Mensagem é obrigatória"),
  courseId: z.string().optional().or(z.literal("")),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

const BASE_PROMPT =
  "Você é o Professor Virtual da ANP, um tutor didático e encorajador. Responda em português, de forma clara e objetiva.";

// POST /api/aluno/tutor — chat com RAG (contexto do material do curso)  (sessão)
export async function POST(request: Request) {
  try {
    await requireSession();
    const { message, courseId, history } = await parseBody(schema, request);

    const { context, sources } = await retrieveContext(message, {
      courseId: courseId || null,
      k: 6,
    });

    const messages: ChatMessage[] = [
      { role: "system", content: augmentSystemPrompt(BASE_PROMPT, context) },
      ...((history ?? []).map((h) => ({ role: h.role, content: h.content })) as ChatMessage[]),
      { role: "user", content: message },
    ];

    try {
      const answer = await chatCompletion(messages);
      return NextResponse.json({
        answer,
        sources: sources.map((s) => ({ content: s.content, score: s.score })),
      });
    } catch (e) {
      if (e instanceof Error && e.message === "NO_API_KEY") {
        // Degrada: IA indisponível, mas devolve os trechos relevantes do material.
        return NextResponse.json({
          answer:
            "IA indisponível (configure OPENROUTER_API_KEY). Enquanto isso, veja os trechos relevantes do material abaixo.",
          simulated: true,
          sources: sources.map((s) => ({ content: s.content, score: s.score })),
        });
      }
      throw e;
    }
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro no tutor IA:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
