# Spec — Sub-projeto #1: Segurança + Hardening

**Data:** 2026-08-04
**Plataforma:** ANP (LMS/EAD Next.js 14 + Prisma + Postgres)
**Escopo:** Hardening só (sem suíte de testes — decisão do usuário)

## Objetivo

Fechar buracos de segurança e consistência da base sem adicionar features.
Diff pequeno, foco em validação de entrada, separação de acesso por role,
type safety e padronização de erros nas rotas de API.

## Contexto atual (o que já está OK)

- `.gitignore` cobre `.env`, `dev.db`, `generated/` — chaves não estão no git.
- Rota `admin/settings` já tem guard de role (ADMIN/SUPER).
- Chaves de IA vivem no DB (`SystemSetting`), mascaradas na leitura, admin-only.
- `auth/register` usa `bcrypt` com custo 12.
- `types/next-auth.d.ts` já tipa `session.user.role` e `token.role`.
- Auth usa estratégia JWT; `role` já é carregado no token.

## Buracos a corrigir

1. `zod` está instalado mas não é usado em nenhuma rota — validação manual e inconsistente.
2. Não há `middleware.ts` — separação de rota por role depende de cada layout (frágil).
3. `(session.user as any).role` / `(user as any).role` — casts desnecessários (tipos já existem).
4. Erros de API sem forma padronizada; risco de vazar detalhe interno em 500.

## Design

### 1. Validação com zod (`lib/api.ts` novo)

Helper central:

- `parseBody(schema, request)`: faz `await request.json()`, valida com o schema.
  Em sucesso retorna os dados tipados. Em falha lança um erro que vira resposta
  `400` com forma `{ error: <mensagem> }` (primeira issue do zod, mensagem legível).

Schemas por rota (inline na rota ou co-localizados):

- **`auth/register` POST:** `name` (string não-vazia), `email` (formato email),
  `password` (min 6). Substitui os `if (!campo)` e o check de tamanho manual.
- **`ai/chat` POST:** `messages` = array de `{ role, content }` (min 1),
  `context` opcional (objeto). Substitui o check `Array.isArray` manual.
- **`admin/settings` PATCH:** `provider` = enum `anthropic|openai|null`,
  `anthropicApiKey`/`openaiApiKey`/`anthropicModel`/`openaiModel` = string opcional.
  Mantém a lógica de "só atualiza chave se não-mascarada" após a validação de forma.

### 2. `middleware.ts` (raiz do projeto)

Usa `withAuth` do `next-auth/middleware`, lendo `token.role`:

- Rotas sob `/admin` → só `ADMIN`/`SUPER`; senão redirect para `/aluno`.
- Demais rotas do dashboard (`/aluno`, etc.) → qualquer usuário autenticado;
  senão redirect para `/login`.
- `matcher` cobre as rotas do grupo `(dashboard)` (paths reais: `/aluno/*`, `/admin/*`).

Gate central. Os checks de sessão nos layouts (`(dashboard)/layout.tsx`,
`admin/layout.tsx`) permanecem como defense-in-depth — não são removidos.

### 3. Remover `as any`

Apagar os casts de role em:

- `lib/auth.ts` (callbacks `jwt` e `session`)
- `app/api/admin/settings/route.ts`
- `app/api/ai/chat/route.ts`

Os tipos em `types/next-auth.d.ts` já cobrem. Zero código novo — só remoção.

### 4. Erros padronizados (`lib/api.ts`)

- `apiError(message, status)`: retorna `NextResponse.json({ error: message }, { status })`.
- Forma de erro consistente `{ error: string }` em todas as rotas.
- Em `catch` de 500: `console.error(...)` para log, resposta genérica
  (`"Erro interno do servidor"`) — nunca serializa o objeto de erro na resposta.

## Fora de escopo (pulado de propósito)

- **Testes automatizados** — usuário escolheu hardening só.
- **Validação de env no boot** — YAGNI; AI keys vivem no DB, e Next quebra alto
  se `DATABASE_URL`/`NEXTAUTH_SECRET` faltarem.
- **Rate limiting** — YAGNI no MVP.

## Ação fora do código (usuário)

Rotacionar/revogar as chaves Anthropic e OpenAI que estavam em texto puro no `.env`
(foram expostas). Tratar como comprometidas.

## Arquivos tocados

- `middleware.ts` — novo
- `lib/api.ts` — novo (parseBody, apiError)
- `app/api/auth/register/route.ts` — validação zod + apiError
- `app/api/ai/chat/route.ts` — validação zod + apiError + remove `as any`
- `app/api/admin/settings/route.ts` — validação zod + apiError + remove `as any`
- `lib/auth.ts` — remove `as any`

## Critério de sucesso

- Rotas rejeitam entrada inválida com `400 { error }` via zod.
- Usuário não-admin não acessa `/admin/*` (redirect).
- `npx tsc --noEmit` limpo, sem `as any` de role.
- App sobe e fluxo de login/registro/chat continua funcionando.
