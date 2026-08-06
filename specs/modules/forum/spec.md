# Spec — Módulo Fórum (forum)

**Fase:** 2 · **Depende de:** Aulas (lessons), RBAC/Matrículas · **Status:** 🚧 parcial (listar + criar)

## Objetivo

Fórum de dúvidas por aula. Aluno lista discussões das aulas em que está matriculado
e abre novas discussões (post raiz). Escopo por matrícula (turma ou matéria), igual
Atividades. Sem mudança de schema — `ForumPost` já existia e estava sem uso.

## Schema

```prisma
// Sem mudança — modelo já existente:
model ForumPost {
  id, lessonId, userId, content, isAI, isResolved, upvotes,
  parentId,           // null = discussão raiz; senão é resposta
  createdAt, updatedAt
  // relações: lesson, user, parent/replies (self-relation "Replies")
}
```
Sem campo `title`: o card usa `content` (excerto). ponytail: adicionar `title` só se o produto exigir título separado.

## API

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| POST | `/api/aluno/forum` `{ lessonId, content }` | sessão + `assertLessonAccess` | cria discussão raiz na aula matriculada |

Listagem é feita direto no server component (Prisma), como em Atividades — sem GET dedicado.

## UI

- `app/(dashboard)/aluno/forum/page.tsx` — server component: lê posts raiz (escopo matrícula),
  stats reais, monta opções de aula matriculada.
- `app/(dashboard)/aluno/forum/forum-client.tsx` — busca client-side, form "Nova Discussão"
  (fetch POST → `router.refresh`), lista de cards.

## Verificação

- **Live:** aluno matriculado vê discussões das suas aulas; cria discussão (201) e ela aparece;
  aluno sem matrícula na aula → 403; sem sessão → 401; conteúdo < 5 chars → 400.

## Pendente (não implementado)

- Tela de discussão individual + respostas (thread).
- Upvote, marcar como resolvido, resposta automática da IA (`isAI`).
- Seed não cria posts — fórum começa vazio.
