# Spec — Módulo Transcrição (transcripts) — Phase 3 M2

**Depende de:** Aulas, KnowledgeBase · **Status:** ✅ implementado

## Objetivo

Obter transcrição da aula (legendas do YouTube ou texto manual), salvar em
`Lesson.transcript` e indexar na KnowledgeBase (sourceType `transcript`) pro RAG.

## lib/transcript.ts

- `parseTimedText(xml)` — XML timedtext → texto corrido (puro/testável).
- `fetchYouTubeTranscript(videoId)` — tenta pt/pt-BR/en; null se indisponível (rede/sem legenda).

## API

`POST /api/admin/lessons/[id]/transcript` (lessons.write), body `{ text? }`:
texto manual se vier, senão busca legendas do vídeo. Salva `Lesson.transcript` +
`indexKnowledge`. Sem vídeo/legenda → 422.

## UI

Dialog "Transcrição" na lessons-table: textarea (colar) + "Buscar do YouTube" / "Salvar texto".

## Verificação

- **Unit:** `parseTimedText` (XML com entidades → texto).
- **Live:** salva texto manual → Lesson.transcript preenchido + chunks indexados + buscável;
  sem legenda/rede → 422; aluno → 403.
