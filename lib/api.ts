import { NextResponse } from "next/server";
import { z } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(
  schema: z.ZodType<T>,
  request: Request
): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError(400, "Corpo da requisição inválido (JSON)");
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new ApiError(400, first?.message ?? "Dados inválidos");
  }
  return result.data;
}
