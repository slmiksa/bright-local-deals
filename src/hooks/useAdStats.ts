import { useState, useEffect, useCallback } from "react";

interface AdStats {
  views: number;
  likes: number;
  liked: boolean;
}

const STATS_KEY = "lamha_ad_stats";
const VIEWED_KEY = "lamha_ad_viewed";

function getStoredStats(): Record<number, { views: number; likes: number }> {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getViewedAds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]");
  } catch {
    return [];
  }
}

function getLikedAds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("lamha_liked") || "[]");
  } catch {
    return [];
  }
}

// Generate fake initial stats for demo
function getInitialStats(id: number): { views: number; likes: number } {
  const seed = id * 137 + 42;
  return {
    views: 120 + (seed % 400),
    likes: 15 + (seed % 60),
  };
}

export function recordView(adId: number) {
  const viewed = getViewedAds();
  if (viewed.includes(adId)) return;
  
  viewed.push(adId);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
  
  const stats = getStoredStats();
  const initial = getInitialStats(adId);
  const current = stats[adId] || initial;
  stats[adId] = { ...current, views: current.views + 1 };
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useAdStats(adId: number): AdStats & { toggleLike: () => void } {
  const initial = getInitialStats(adId);
  const stored = getStoredStats()[adId] || initial;
  const liked = getLikedAds().includes(adId);

  const [stats, setStats] = useState<AdStats>({
    views: stored.views,
    likes: stored.likes,
    liked,
  });

  const toggleLike = useCallback(() => {
    setStats((prev) => {
      const newLiked = !prev.liked;
      const newLikes = newLiked ? prev.likes + 1 : prev.likes - 1;

      // Persist
      const allStats = getStoredStats();
      const initial = getInitialStats(adId);
      const current = allStats[adId] || initial;
      allStats[adId] = { ...current, likes: newLikes };
      localStorage.setItem(STATS_KEY, JSON.stringify(allStats));

      const likedAds = getLikedAds();
      if (newLiked) {
        likedAds.push(adId);
      } else {
        const idx = likedAds.indexOf(adId);
        if (idx > -1) likedAds.splice(idx, 1);
      }
      localStorage.setItem("lamha_liked", JSON.stringify(likedAds));

      return { views: prev.views, likes: newLikes, liked: newLiked };
    });
  }, [adId]);

  return { ...stats, toggleLike };
}
