import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/authz";
import { retrieveContext, augmentSystemPrompt } from "@/lib/rag";
import {
  chatCompletion,
  chatCompletionStream,
  type ChatMessage,
} from "@/lib/ai/openrouter";
import { buildSystemPrompt } from "@/lib/ai/professor-virtual";
import prisma from "@/lib/prisma";

const schema = z.object({
  message: z.string().trim().min(1, "Mensagem é obrigatória"),
  courseId: z.string().optional().or(z.literal("")),
  lessonTitle: z.string().optional(),
  lessonContent: z.string().optional(),
  subjectTitle: z.string().optional(),
  stream: z.boolean().optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

const NO_GATEWAY_MSG =
  "IA indisponível (configure OmniRoute em Admin → Configurações ou OMNIROUTE_* no .env). Enquanto isso, veja os trechos relevantes do material abaixo.";

async function buildMessages(input: {
  message: string;
  courseId?: string | null;
  lessonTitle?: string;
  lessonContent?: string;
  subjectTitle?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<{ messages: ChatMessage[]; sources: { content: string; score: number }[] }> {
  const course = input.courseId
    ? await prisma.course.findUnique({
        where: { id: input.courseId },
        select: {
          title: true,
          description: true,
          aiPersona: true,
          aiContext: true,
        },
      })
    : null;

  const { context, sources } = await retrieveContext(input.message, {
    courseId: input.courseId || null,
    k: 6,
  });

  const courseDescription = [course?.description, course?.aiContext]
    .filter(Boolean)
    .join("\n\n");

  const base = buildSystemPrompt({
    courseName: course?.title || "Curso",
    courseDescription,
    aiPersona: course?.aiPersona || undefined,
    lessonTitle: input.lessonTitle,
    lessonContent: input.lessonContent,
    subjectTitle: input.subjectTitle,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: augmentSystemPrompt(base, context) },
    ...((input.history ?? []).map((h) => ({
      role: h.role,
      content: h.content,
    })) as ChatMessage[]),
    { role: "user", content: input.message },
  ];

  return {
    messages,
    sources: sources.map((s) => ({ content: s.content, score: s.score })),
  };
}

// POST /api/aluno/tutor — chat com RAG + persona da turma (sessão)
export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await parseBody(schema, request);
    const { messages, sources } = await buildMessages(body);

    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (obj: unknown) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };
          try {
            send({ type: "sources", sources });
            for await (const delta of chatCompletionStream(messages)) {
              send({ type: "delta", text: delta });
            }
            send({ type: "done" });
          } catch (e) {
            if (e instanceof Error && e.message === "NO_API_KEY") {
              send({
                type: "error",
                answer: NO_GATEWAY_MSG,
                simulated: true,
                sources,
              });
            } else {
              console.error("Erro no stream do tutor IA:", e);
              send({
                type: "error",
                answer: "Falha ao gerar resposta da IA. Tente novamente.",
              });
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    try {
      const answer = await chatCompletion(messages);
      return NextResponse.json({ answer, sources });
    } catch (e) {
      if (e instanceof Error && e.message === "NO_API_KEY") {
        return NextResponse.json({
          answer: NO_GATEWAY_MSG,
          simulated: true,
          sources,
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
