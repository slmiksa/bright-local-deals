import { useState, useEffect } from "react";

const posterCache = new Map<string, string>();

export function useVideoPoster(videoUrl: string) {
  const [poster, setPoster] = useState<string | null>(posterCache.get(videoUrl) || null);

  useEffect(() => {
    if (posterCache.has(videoUrl)) {
      setPoster(posterCache.get(videoUrl)!);
      return;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.addEventListener("loadeddata", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          posterCache.set(videoUrl, dataUrl);
          setPoster(dataUrl);
        }
      } catch {
        // CORS or other error - ignore
      }
      cleanup();
    }, { once: true });

    video.addEventListener("error", () => cleanup(), { once: true });

    video.src = videoUrl;
    video.load();

    return () => cleanup();
  }, [videoUrl]);

  return poster;
}
