# Harness de Engenharia — ANP LMS

Camada permanente de engenharia: mantém **contexto, rastreabilidade e padronização** orientados por documentação, histórico de Git, specs e arquitetura.

## 1. Fluxo obrigatório (nenhuma feature entra sem isso)

1. **Ler a documentação** — [specs/README.md](specs/README.md), [specs/architecture.md](specs/architecture.md), spec do módulo alvo.
2. **Ler os commits recentes** — `git log --oneline -20` (ou `npm run harness`).
3. **Identificar o estado atual** — `npm run harness` (módulos sem spec, features sem doc, commits não enviados).
4. **Verificar dependências entre módulos** — ver a seção "Depende de" no spec.
5. **Criar/atualizar a spec** — `npm run harness new <módulo>` gera o esqueleto em `specs/modules/<módulo>/spec.md` (+ `tasks.md`/`api.md`/`database.md` se precisar detalhar). PM/Architect aprovam. Registrar no índice `specs/README.md`.
6. **Validar impacto na arquitetura** — atualizar `specs/architecture.md` e criar ADR em `specs/decisions/` se houver decisão nova. Tech Lead (Codex) valida.
7. **Implementar** — Tech Lead (Codex) coordena e delega por complexidade (ver §5); Backend/Frontend/AI/DB implementam conforme a área.
8. **Atualizar a documentação** — status do spec, changelog do sprint, roadmap. Rodar `npm run harness` (deve ficar limpo).

> Regra: **sem spec, sem código.** Cada feature tem sua própria doc (um arquivo por módulo, não tudo num só).

## 2. Harness (leitura automática do Git)

```bash
npm run harness            # relatório: git x specs, features sem doc, progresso
npm run harness new <nome> # scaffold da spec + time de agentes (spec antes do código)
```
`npm run harness` cruza `git log` com `specs/modules/`:
- lista módulos e quais têm `spec.md`;
- detecta commits `feat`/`fix` cujo escopo **não** tem módulo documentado (aliases em `scripts/harness.mjs`);
- mostra branch e commits não enviados;
- aponta o próximo passo do fluxo.

`npm run harness new <nome>` cria `specs/modules/<nome>/spec.md` do template, imprime o Tech Lead (Codex) e o roteamento por complexidade, e lembra de registrar no índice. **Não sobrescreve** spec existente.

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

## 5. Uso de IA — Codex é o Tech Lead

- **Codex = Tech Lead**: coordena a feature, lê a spec, classifica a complexidade, delega ao agente/modelo certo, revisa e aprova antes de integrar (ver plugin codex).
- **Roteamento por complexidade da tarefa** (impresso por `npm run harness new`):

| Complexidade / área | Agente | Modelo |
|---------------------|--------|--------|
| Arquitetura / contrato entre módulos | software-architect + tech-lead | opus |
| Segurança / auth / LGPD | security-engineer | opus |
| Backend / API / Prisma | backend-engineer | sonnet |
| Frontend / UI / UX | frontend-engineer + uiux-designer | sonnet |
| Banco / migração / índices | database-engineer | sonnet |
| IA / RAG / prompts | ai-engineer | sonnet (opus se crítico) |
| Testes / QA | qa-engineer | sonnet |
| Infra / deploy | devops-engineer | sonnet |

- Tarefa simples → um agente/`sonnet`. Tarefa crítica/ampla → `opus` + revisão do Tech Lead.

## 6. Padrões (resumo)
Zod único (form+server) · `requirePermission()` em toda mutação · erros `{error}` · tokens de tema (sem cor hardcoded) · Base UI `render`/`nativeButton` · pgvector literal inline · um teste por lógica não-trivial · Conventional Commits com escopo = módulo.
