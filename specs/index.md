# ANP LMS — Índice de Specs

Metodologia **spec-driven**: cada módulo tem seu `spec.md`, aprovado antes da implementação.

## Phase 1 — Base Acadêmica ✅

| Módulo | Dir | Status |
|--------|-----|--------|
| RBAC / Permissões | (fundação) | ✅ |
| Alunos | `specs/students/` | ✅ |
| Cursos | `specs/courses/` | ✅ |
| Disciplinas | `specs/subjects/` | ✅ |
| Aulas (Módulos+Lições) | `specs/lessons/` | ✅ |
| YouTube Manager | `specs/youtube/` | ✅ |

## Phase 2 — Ensino (em andamento)

Decisões: escopo completo (autoria+submissão+correção); correção via **OpenRouter**;
certificados **PDF on-the-fly** (sem storage) + registro `Certificate`; **banco de questões reusável**.

| # | Módulo | Dir | Status |
|---|--------|-----|--------|
| 1 | Banco de Questões | `specs/question-bank/` | draft |
| 2 | Atividades (autoria + submissão) | `specs/activities/` | pending |
| 3 | Correção (IA OpenRouter + manual) | `specs/grading/` | pending |
| 4 | Notas (gradebook) | `specs/gradebook/` | pending |
| 5 | Certificados | `specs/certificates/` | pending |

## Fases futuras

- **Phase 3 — IA**: RAG, tutor IA, busca semântica, transcrição.
- **Phase 4 — BI**: analytics, dashboards, relatórios, auditoria.
