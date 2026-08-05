# Spec — Módulo YouTube (youtube-manager)

**Fase:** 1 · **Depende de:** Aulas · **Status:** ✅ implementado

## Objetivo

Buscar metadados de um vídeo do YouTube (título, duração, thumbnail, canal) via
YouTube Data API v3 e preencher a aula. **Sem tabela nova** — usa campos do `Lesson`
(`videoUrl`, `videoId`, `duration`) + `getYouTubeThumbnail` (derivado do videoId).

## Chave

`getSetting("youtube_api_key")` (DB, painel admin) → fallback `process.env.YOUTUBE_API_KEY`.
Sem chave: endpoint responde **503** com mensagem clara (UI faz toast).

## lib/youtube.ts

- `parseIsoDuration(iso)` — ISO 8601 (`PT#H#M#S`) → segundos (+ unit test).
- `getYouTubeApiKey()` — settings→env.
- `fetchVideoMetadata(videoId)` — GET `youtube/v3/videos?part=snippet,contentDetails` →
  `{ videoId, title, durationSeconds, thumbnail, channelTitle }`. Vídeo inexistente → null.

## API

`POST /api/admin/youtube/metadata` (gate `lessons.write`) — body `{ url }`.
Extrai videoId (`getYouTubeVideoId`), busca metadados. Retornos: 200 metadados; 400 URL inválida;
404 vídeo não encontrado; 503 sem chave.

## Integração na aula

- `LessonDialog`: botão **"Buscar do YouTube"** ao lado de `videoUrl` → chama o endpoint,
  preenche `title` (se vazio) e guarda `duration` (segundos) pra salvar.
- `lessonCreate/UpdateSchema` ganham `duration` (int opcional); POST/PATCH persistem.

## Verificação

- **Unit:** `parseIsoDuration` (H/M/S, só M, só S).
- **Live:** POST metadata sem chave → 503 (comportamento esperado neste ambiente sem key);
  com chave (se configurada) → 200. Fluxo de UI validado por build + carga da página.
