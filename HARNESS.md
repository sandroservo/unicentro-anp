# Harness de Engenharia — ANP LMS

Camada permanente de engenharia: mantém **contexto, rastreabilidade e padronização** orientados por documentação, histórico de Git, specs e arquitetura.

## 1. Fluxo obrigatório (nenhuma feature entra sem isso)

1. **Ler a documentação** — [specs/README.md](specs/README.md), [specs/architecture.md](specs/architecture.md), spec do módulo alvo.
2. **Ler os commits recentes** — `git log --oneline -20` (ou `npm run harness`).
3. **Identificar o estado atual** — `npm run harness` (módulos sem spec, features sem doc, commits não enviados).
4. **Verificar dependências entre módulos** — ver a seção "Depende de" no spec.
5. **Criar/atualizar a spec** — `specs/modules/<módulo>/spec.md` (+ `tasks.md`/`api.md`/`database.md` se precisar detalhar). PM/Architect aprovam.
6. **Validar impacto na arquitetura** — atualizar `specs/architecture.md` e criar ADR em `specs/decisions/` se houver decisão nova. Tech Lead valida.
7. **Implementar** — Backend/Frontend/AI/DB conforme a área. Codex é o implementador principal.
8. **Atualizar a documentação** — status do spec, changelog do sprint, roadmap. Rodar `npm run harness` (deve ficar limpo).

> Regra: **sem spec, sem código.** Cada feature tem sua própria doc (um arquivo por módulo, não tudo num só).

## 2. Harness (leitura automática do Git)

```bash
npm run harness
```
Cruza `git log` com `specs/modules/`:
- lista módulos e quais têm `spec.md`;
- detecta commits `feat`/`fix` cujo escopo **não** tem módulo documentado (aliases em `scripts/harness.mjs`);
- mostra branch e commits não enviados;
- aponta o próximo passo do fluxo.

## 3. Estrutura de documentação

```
specs/
├── README.md          # índice geral
├── roadmap.md         # fases e progresso
├── architecture.md    # arquitetura geral
├── decisions/         # ADR-00N.md (decisões arquiteturais)
├── modules/<nome>/    # spec.md (+ tasks.md/api.md/database.md quando precisar)
└── changelog/         # sprint-00N.md
```

## 4. Time de agentes (`.claude/agents/`)

Cada papel é um subagente especializado (invocável via Task/`@agente`):

| Agente | Área |
|--------|------|
| **tech-lead** | arquitetura, revisão, planejamento, aprovação |
| **product-manager** | PRDs, requisitos, priorização, roadmap |
| **software-architect** | arquitetura, modelagem, integrações, escala |
| **backend-engineer** | APIs, Prisma/Postgres, regras, segurança de endpoint |
| **frontend-engineer** | Next.js, Tailwind, shadcn/Base UI, UX |
| **mobile-engineer** | React Native, PWA |
| **uiux-designer** | design system, UX, componentes |
| **devops-engineer** | Docker, CI/CD, deploy, monitoramento |
| **qa-engineer** | Vitest, Playwright, qualidade |
| **security-engineer** | auditoria, LGPD, auth, vulnerabilidades |
| **database-engineer** | modelagem, índices, migrações |
| **ai-engineer** | LLMs/OpenRouter, prompts, RAG, embeddings |

## 5. Uso de IA

- **Codex**: implementador principal de código (ver plugin codex).
- **Delegação por natureza da tarefa**: arquitetura/revisão/segurança → agentes `opus`; implementação/testes/UX/DB → `sonnet`.
- O **Tech Lead** coordena os modelos e consolida antes de integrar.

## 6. Padrões (resumo)
Zod único (form+server) · `requirePermission()` em toda mutação · erros `{error}` · tokens de tema (sem cor hardcoded) · Base UI `render`/`nativeButton` · pgvector literal inline · um teste por lógica não-trivial · Conventional Commits com escopo = módulo.
