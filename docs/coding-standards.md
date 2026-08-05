# Padrões de Código — ANP LMS

> Stub. Expandido conforme os módulos consolidam padrões.

- **TypeScript** estrito. Sem `as any` (tipos em `types/`).
- **Validação**: um schema Zod por entrada, reutilizado no form (RHF) e no server (`parseBody` de `lib/api.ts`).
- **Erros de API**: sempre `{ error: string }` via `apiError`; 500 nunca serializa o objeto de erro.
- **Autorização**: `requirePermission()` em toda mutação; nunca confiar só em esconder UI.
- **Data fetching**: TanStack Query no client; Server Components onde couber.
- **Componentes**: primitivos shadcn em `components/ui/`; layout em `components/layout/`; features em `components/<módulo>/`.
- **Commits**: Conventional Commits, 1 deliverable testável por commit.
- **Reuso primeiro**: checar `lib/` (`api`, `utils`, `settings`, `authz`, `ai`) antes de escrever novo helper.
