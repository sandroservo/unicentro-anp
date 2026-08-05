// lib/ai/providers/anthropic.ts
import type { AIMessage } from "../professor-virtual";

export async function callAnthropic(
  messages: AIMessage[],
  systemPrompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || process.env.AI_ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
