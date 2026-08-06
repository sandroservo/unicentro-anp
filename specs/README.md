# ANP LMS — Especificações

Índice geral da documentação spec-driven. **Nenhuma feature entra sem spec** (ver [fluxo obrigatório](../HARNESS.md)).

## Meta

- [roadmap.md](roadmap.md) — fases e progresso
- [architecture.md](architecture.md) — arquitetura geral
- [decisions/](decisions/) — ADRs (decisões arquiteturais)
- [changelog/](changelog/) — histórico por sprint
- [../HARNESS.md](../HARNESS.md) — camada de engenharia, fluxo obrigatório, time de agentes

## Módulos

Cada módulo: `specs/modules/<nome>/spec.md` (+ `tasks.md` / `api.md` / `database.md` quando precisar detalhar).

### Fase 1 — Base Acadêmica ✅
| Módulo | Spec | Status |
|--------|------|--------|
| Autenticação (Auth.js v5) | [authentication](modules/authentication/spec.md) | ✅ |
| RBAC / Permissões | [rbac](modules/rbac/spec.md) | ✅ |
| Alunos | [students](modules/students/spec.md) | ✅ |
| Cursos | [courses](modules/courses/spec.md) | ✅ |
| Disciplinas | [subjects](modules/subjects/spec.md) | ✅ |
| Aulas (Módulos+Lições) | [lessons](modules/lessons/spec.md) | ✅ |
| YouTube Manager | [youtube](modules/youtube/spec.md) | ✅ |

### Fase 2 — Ensino ✅
| Módulo | Spec | Status |
|--------|------|--------|
| Banco de Questões | [question-bank](modules/question-bank/spec.md) | ✅ |
| Atividades | [activities](modules/activities/spec.md) | ✅ |
| Correção (IA + manual) | [grading](modules/grading/spec.md) | ✅ |
| Notas (gradebook) | [gradebook](modules/gradebook/spec.md) | ✅ |
| Certificados | [certificates](modules/certificates/spec.md) | ✅ |
| Fórum (aluno) | [forum](modules/forum/spec.md) | 🚧 listar + criar |

### Fase 3 — IA ✅
| Módulo | Spec | Status |
|--------|------|--------|
| KnowledgeBase + Embeddings | [knowledge-base](modules/knowledge-base/spec.md) | ✅ |
| Transcrição | [transcripts](modules/transcripts/spec.md) | ✅ |
| RAG | [rag](modules/rag/spec.md) | ✅ |
| Tutor IA | [tutor-ia](modules/tutor-ia/spec.md) | ✅ |
| Busca Semântica | [semantic-search](modules/semantic-search/spec.md) | ✅ |

### Fase 4 — BI (pendente)
Analytics, dashboards, relatórios, auditoria — ver [roadmap](roadmap.md).

## Como usar

```bash
npm run harness        # estado do projeto: git x specs, features sem doc, progresso
```
