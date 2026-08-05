// lib/ai/providers/openai.ts
import type { AIMessage } from "../professor-virtual";

export async function callOpenAI(
  messages: AIMessage[],
  systemPrompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const openaiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || process.env.AI_OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 1024,
      messages: openaiMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI API: resposta inválida");
  }
  return content;
}
