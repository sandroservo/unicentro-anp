import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { getYouTubeThumbnail } from "@/lib/utils";

export type VideoMetadata = {
  videoId: string;
  title: string;
  durationSeconds: number;
  thumbnail: string;
  channelTitle: string;
};

// ISO 8601 (PT#H#M#S) -> segundos. Puro, testável.
export function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  return h * 3600 + min * 60 + s;
}

export async function getYouTubeApiKey(): Promise<string | null> {
  const fromDb = await getSetting(SETTING_KEYS.YOUTUBE_API_KEY);
  return fromDb || process.env.YOUTUBE_API_KEY || null;
}

// Busca metadados na YouTube Data API v3. null = vídeo inexistente.
// Lança Error("NO_API_KEY") se não houver chave configurada.
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const key = await getYouTubeApiKey();
  if (!key) throw new Error("NO_API_KEY");

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(
    videoId
  )}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    videoId,
    title: item.snippet?.title ?? "",
    durationSeconds: parseIsoDuration(item.contentDetails?.duration ?? ""),
    thumbnail: getYouTubeThumbnail(videoId),
    channelTitle: item.snippet?.channelTitle ?? "",
  };
}
