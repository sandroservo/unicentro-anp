import { z } from "zod";

export const QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "ESSAY"] as const;

const optionSchema = z.object({
  text: z.string().trim().min(1, "Texto da alternativa é obrigatório"),
  correct: z.boolean(),
});

export const questionCreateSchema = z
  .object({
    type: z.enum(QUESTION_TYPES),
    statement: z.string().trim().min(1, "Enunciado é obrigatório"),
    options: z.array(optionSchema).optional(),
    answerKey: z.string().trim().optional().or(z.literal("")),
    points: z.coerce.number().int().positive().optional(),
    categoryId: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const needsOptions = data.type === "MULTIPLE_CHOICE" || data.type === "TRUE_FALSE";
    if (needsOptions) {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Informe ao menos 2 alternativas" });
      } else if (!data.options.some((o) => o.correct)) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Marque ao menos uma alternativa correta" });
      }
    }
  });

export const questionUpdateSchema = questionCreateSchema;

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});

export type QuestionInput = z.infer<typeof questionCreateSchema>;
