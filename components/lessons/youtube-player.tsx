"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
};

type YouTubePlayerProps = {
  videoId: string;
  title: string;
  onWatchComplete: () => void;
  onProgress?: (percent: number) => void;
};

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    // Se a API já carregou entre a checagem e o script
    if (window.YT?.Player) resolve();
  });

  return apiLoadPromise;
}

export function YouTubePlayer({
  videoId,
  title,
  onWatchComplete,
  onProgress,
}: YouTubePlayerProps) {
  const reactId = useId().replace(/:/g, "");
  const containerId = `yt-player-${reactId}`;
  const playerRef = useRef<YTPlayer | null>(null);
  const completedRef = useRef(false);
  const maxPercentRef = useRef(0);
  const onWatchCompleteRef = useRef(onWatchComplete);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onWatchCompleteRef.current = onWatchComplete;
    onProgressRef.current = onProgress;
  }, [onWatchComplete, onProgress]);

  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    completedRef.current = false;
    maxPercentRef.current = 0;

    const markComplete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      maxPercentRef.current = 100;
      onProgressRef.current?.(100);
      onWatchCompleteRef.current();
    };

    const trackProgress = (player: YTPlayer) => {
      const duration = player.getDuration();
      if (!duration || duration <= 0) return;
      const current = player.getCurrentTime();
      const percent = Math.min(100, (current / duration) * 100);
      if (percent > maxPercentRef.current) {
        maxPercentRef.current = percent;
        onProgressRef.current?.(percent);
      }
      // Quase no fim (evita depender só do ENDED em alguns browsers)
      if (percent >= 98) markComplete();
    };

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            poll = setInterval(() => {
              try {
                const state = e.target.getPlayerState();
                // 1 = PLAYING
                if (state === 1) trackProgress(e.target);
              } catch {
                /* player destruído */
              }
            }, 1000);
          },
          onStateChange: (e) => {
            // 0 = ENDED
            if (e.data === 0) markComplete();
            if (e.data === 1 || e.data === 2) trackProgress(e.target);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [videoId, containerId]);

  return (
    <div className="relative aspect-video bg-black">
      <div id={containerId} className="absolute inset-0 h-full w-full" title={title} />
    </div>
  );
}
