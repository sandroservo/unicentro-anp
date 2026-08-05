# Segurança + Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar buracos de segurança/consistência da API do ANP sem adicionar features: validação zod, middleware de role, remoção de `as any`, erros padronizados.

**Architecture:** Um helper central (`lib/api.ts`) provê `parseBody` (valida corpo com zod → 400 padronizado) e `apiError`. As 3 rotas passam a validar via zod e responder com forma `{ error }` consistente. Um `middleware.ts` na raiz usa `withAuth` do next-auth para gatear `/admin` (ADMIN/SUPER) e o dashboard (autenticado). Casts `as any` de role são removidos — os tipos já existem em `types/next-auth.d.ts`.

**Tech Stack:** Next.js 14 (App Router), next-auth (JWT), zod 4, TypeScript.

## Global Constraints

- Sem suíte de testes (decisão do usuário) — verificação por `npx tsc --noEmit` + curl manual.
- `zod` já é dependência (`^4.3.6`). Não adicionar libs novas.
- Forma de erro de API sempre `{ error: string }`.
- Respostas 500 nunca serializam o objeto de erro — só `console.error` no servidor.
- Guards de sessão existentes nos layouts permanecem (defense-in-depth) — não remover.

---

### Task 1: Helper de API (`lib/api.ts`)

**Files:**
- Create: `lib/api.ts`

**Interfaces:**
- Produces:
  - `class ApiError extends Error { status: number }`
  - `apiError(message: string, status?: number): NextResponse`
  - `parseBody<T>(schema: z.ZodType<T>, request: Request): Promise<T>` — retorna dados válidos ou lança `ApiError(400, msg)`.

- [ ] **Step 1: Criar `lib/api.ts`**

```ts
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
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add lib/api.ts
git commit -m "feat(api): helper parseBody + apiError com validação zod"
```

---

### Task 2: Remover `as any` de role (`lib/auth.ts`)

**Files:**
- Modify: `lib/auth.ts` (callbacks `jwt` e `session`)

**Interfaces:**
- Consumes: tipos `User`/`JWT`/`Session` de `types/next-auth.d.ts` (já definem `role: string`).

- [ ] **Step 1: Substituir os callbacks**

Trocar o bloco `callbacks` por:

```ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
```

- [ ] **Step 2: Verificar tipos (sem `as any`)**

Run: `npx tsc --noEmit`
Expected: sem erros. Se `token.id`/`user.id` acusar tipo, confirmar que `types/next-auth.d.ts` declara `id` em `User` e `JWT` (declara).

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "refactor(auth): remove casts as any (tipos já existem)"
```

---

### Task 3: Validação no registro (`app/api/auth/register/route.ts`)

**Files:**
- Modify: `app/api/auth/register/route.ts`

**Interfaces:**
- Consumes: `parseBody`, `apiError`, `ApiError` de `lib/api.ts`.

- [ ] **Step 1: Reescrever a rota**

```ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseBody, apiError, ApiError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const { name, email, password } = await parseBody(registerSchema, request);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError("Este email já está cadastrado", 400);
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "STUDENT" },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao registrar:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Testar manualmente (dev server rodando)**

```bash
# inválido → 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/auth/register \
  -H 'content-type: application/json' -d '{"name":"","email":"x","password":"1"}'
# esperado: 400
```

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/register/route.ts
git commit -m "feat(register): validação zod + erro padronizado"
```

---

### Task 4: Validação no chat IA (`app/api/ai/chat/route.ts`)

**Files:**
- Modify: `app/api/ai/chat/route.ts`

**Interfaces:**
- Consumes: `parseBody`, `apiError`, `ApiError` de `lib/api.ts`.

- [ ] **Step 1: Ajustar imports e validação**

Adicionar imports:

```ts
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";
```

Adicionar schema (topo do arquivo, após imports):

```ts
const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .min(1, "Mensagens são obrigatórias"),
  context: z.record(z.string(), z.unknown()).optional(),
});
```

Dentro do `POST`, trocar o bloco de auth + parse manual por:

```ts
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Não autorizado", 401);

    const { messages, context } = await parseBody(chatSchema, request);
```

(Remover o `if (!messages || !Array.isArray(messages))` manual e qualquer `(session.user as any)` presente.)

- [ ] **Step 2: Padronizar o catch**

Garantir que o `catch` final da rota trate `ApiError`:

```ts
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro no chat IA:", error);
    return apiError("Erro interno do servidor", 500);
  }
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Testar manualmente**

```bash
# sem sessão → 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/ai/chat \
  -H 'content-type: application/json' -d '{"messages":[]}'
# esperado: 401 (sem cookie de sessão)
```

- [ ] **Step 5: Commit**

```bash
git add app/api/ai/chat/route.ts
git commit -m "feat(ai-chat): validação zod + erro padronizado + remove as any"
```

---

### Task 5: Validação nas configurações admin (`app/api/admin/settings/route.ts`)

**Files:**
- Modify: `app/api/admin/settings/route.ts`

**Interfaces:**
- Consumes: `parseBody`, `apiError`, `ApiError` de `lib/api.ts`.

- [ ] **Step 1: Imports + schema**

Adicionar:

```ts
import { z } from "zod";
import { parseBody, apiError, ApiError } from "@/lib/api";

const settingsSchema = z.object({
  provider: z.enum(["anthropic", "openai"]).nullable().optional(),
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  anthropicModel: z.string().optional(),
  openaiModel: z.string().optional(),
});
```

- [ ] **Step 2: Guard de role sem `as any` + validação**

No `GET` e no `PATCH`, trocar:

```ts
  const role = (session?.user as any)?.role;
  if (!session || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
```

por:

```ts
  const role = session?.user?.role;
  if (!session || !role || !ADMIN_ROLES.includes(role)) {
    return apiError("Não autorizado", 401);
  }
```

No `PATCH`, trocar `const body = await request.json();` por:

```ts
  const body = await parseBody(settingsSchema, request);
```

Manter a lógica existente de "só atualiza chave se não-mascarada". Envolver o corpo do `PATCH` num `try/catch`:

```ts
  } catch (error) {
    if (error instanceof ApiError) return apiError(error.message, error.status);
    console.error("Erro ao salvar settings:", error);
    return apiError("Erro interno do servidor", 500);
  }
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros, sem `as any`.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/settings/route.ts
git commit -m "feat(admin-settings): validação zod + erro padronizado + remove as any"
```

---

### Task 6: Middleware de role (`middleware.ts`)

**Files:**
- Create: `middleware.ts` (raiz do projeto)

**Interfaces:**
- Consumes: `token.role` (JWT tipado em `types/next-auth.d.ts`).

- [ ] **Step 1: Criar `middleware.ts`**

```ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER";
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/aluno", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/aluno/:path*", "/admin/:path*"],
};
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros (`token?.role` tipado via JWT).

- [ ] **Step 3: Testar manualmente**

Com dev server rodando:
- Deslogado acessando `/aluno` → redireciona para `/login`.
- Logado como STUDENT acessando `/admin` → redireciona para `/aluno`.
- Logado como ADMIN acessando `/admin` → carrega.

(Credenciais de teste no README: `aluno@anp.com` / `admin@anp.com`, senha `123456` — após rodar o seed.)

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat(middleware): gate de role em /admin e dashboard"
```

---

## Self-Review

**Spec coverage:**
- Validação zod (register, ai/chat, admin settings) → Tasks 3, 4, 5 ✓
- middleware.ts de role → Task 6 ✓
- Remover `as any` → Tasks 2, 4, 5 ✓
- Erros padronizados / 500 sem vazar → Task 1 + aplicado em 3/4/5 ✓
- Fora de escopo (testes, env boot, rate limit) → não incluído, conforme spec ✓

**Placeholder scan:** nenhum TBD/TODO; todo passo tem código concreto.

**Type consistency:** `ApiError`, `apiError`, `parseBody` definidos na Task 1 e usados igual nas Tasks 3–5. `token.role`/`user.role`/`session.user.role` consistentes com `types/next-auth.d.ts`.
