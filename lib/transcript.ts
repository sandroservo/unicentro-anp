// Transcrição de aulas via legendas do YouTube (timedtext). Leve, sem áudio/storage.

// Decodifica entidades HTML comuns do timedtext.
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Converte o XML do timedtext em texto corrido. Puro/testável.
export function parseTimedText(xml: string): string {
  const matches = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)];
  return matches
    .map((m) => decodeEntities(m[1].replace(/\n/g, " ")).trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// Busca legendas do vídeo (tenta pt, depois en). null se indisponível.
export async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  for (const lang of ["pt", "pt-BR", "en"]) {
    try {
      const url = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${encodeURIComponent(videoId)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const xml = await res.text();
      const text = parseTimedText(xml);
      if (text) return text;
    } catch {
      // rede indisponível / sem legenda nessa língua — tenta a próxima
    }
  }
  return null;
}
