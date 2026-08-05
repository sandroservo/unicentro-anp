# Spec — Módulo Banco de Questões (question-bank)

**Fase:** 2 · **Depende de:** RBAC · **Status:** ✅ implementado. Verificado: CRUD + refine 400 + gate.

## Objetivo

Pool reusável de questões, organizadas por categoria, que as Atividades referenciam.
Primeiro módulo da Phase 2 — base pra Atividades e Correção.

## Schema (novo)

```prisma
model QuestionCategory {
  id        String     @id @default(cuid())
  name      String     @unique
  questions Question[]
}

model Question {
  id          String   @id @default(cuid())
  categoryId  String?
  category    QuestionCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  type        String   // MULTIPLE_CHOICE | TRUE_FALSE | ESSAY
  statement   String   // enunciado
  options     String?  // JSON: [{ text, correct }] p/ MC/TF; null p/ ESSAY
  answerKey   String?  // gabarito/rubrica (texto); usado na correção
  points      Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
Aditivo, sem impacto no schema atual. Enums como String (padrão do projeto).

## Permissões

Nova permissão `questions.write` (mutar) — adicionar em `lib/rbac.ts` (roles
SUPER_ADMIN, ADMINISTRADOR, COORDENADOR, PROFESSOR). Ver = `courses.read`.
Re-seed pra vincular a permissão nova.

## API (`requirePermission`)

Categorias:
| GET/POST | `/api/admin/question-categories` | courses.read / questions.write |
| DELETE | `/api/admin/question-categories/[id]` | questions.write |

Questões:
| GET | `/api/admin/questions?q=&categoryId=&type=` | courses.read | lista/filtra |
| POST | `/api/admin/questions` | questions.write | cria |
| PATCH/DELETE | `/api/admin/questions/[id]` | questions.write | edita/remove |

Validação zod (`lib/validations/question.ts`): `type` enum; `options` obrigatório e
não-vazio pra MC/TF (com ≥1 correta), nulo pra ESSAY; `statement` obrigatório.

## UI

- `app/(dashboard)/admin/questoes/page.tsx` (gate `courses.read`, `canWrite` = questions.write).
- `components/questions/questions-table.tsx`: lista, busca, filtro por tipo/categoria, badge tipo.
- `components/questions/question-dialog.tsx`: form RHF — enunciado, tipo (select),
  editor de alternativas dinâmico (MC/TF) com marcação de corretas, rubrica (ESSAY), pontos, categoria.
- Item "Banco de Questões" na sidebar por `questions.write`.

## Verificação

- **Unit:** schema zod (MC exige ≥1 correta; ESSAY sem options; TF).
- **Live:** admin cria categoria + questões (MC/ESSAY) → lista/filtra → edita → remove;
  aluno (sem `questions.write`) → POST 403.

## Nota

Alternativas dinâmicas (add/remove opção, marcar correta) são a parte nova de UI vs
os CRUDs anteriores. Resto segue o padrão estabelecido.
