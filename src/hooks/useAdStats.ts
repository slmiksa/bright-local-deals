import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdStats {
  views: number;
  likes: number;
  liked: boolean;
}

function getLikedAds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("lamha_liked") || "[]");
  } catch {
    return [];
  }
}

function getViewedAds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("lamha_ad_viewed") || "[]");
  } catch {
    return [];
  }
}

export async function recordView(adId: number) {
  const viewed = getViewedAds();
  if (viewed.includes(adId)) return;

  viewed.push(adId);
  localStorage.setItem("lamha_ad_viewed", JSON.stringify(viewed));

  // Upsert view count in DB
  const { data: existing } = await supabase
    .from("ad_stats")
    .select("id, views")
    .eq("ad_id", adId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("ad_stats")
      .update({ views: (existing.views || 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("ad_stats")
      .insert({ ad_id: adId, views: 1, likes: 0 });
  }
}

export function useAdStats(adId: number): AdStats & { toggleLike: () => void } {
  const [stats, setStats] = useState<AdStats>({
    views: 0,
    likes: 0,
    liked: getLikedAds().includes(adId),
  });
  const [fetched, setFetched] = useState(false);

  // Fetch real stats from DB
  useEffect(() => {
    if (!adId || fetched) return;
    let cancelled = false;
    
    supabase
      .from("ad_stats")
      .select("views, likes")
      .eq("ad_id", adId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setStats(prev => ({
            ...prev,
            views: data.views || 0,
            likes: data.likes || 0,
          }));
        }
        setFetched(true);
      });

    return () => { cancelled = true; };
  }, [adId, fetched]);

  const toggleLike = useCallback(async () => {
    const likedAds = getLikedAds();
    const currentlyLiked = likedAds.includes(adId);
    const newLiked = !currentlyLiked;

    // Update local state immediately (optimistic)
    setStats(prev => ({
      ...prev,
      liked: newLiked,
      likes: newLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
    }));

    // Update localStorage
    if (newLiked) {
      likedAds.push(adId);
    } else {
      const idx = likedAds.indexOf(adId);
      if (idx > -1) likedAds.splice(idx, 1);
    }
    localStorage.setItem("lamha_liked", JSON.stringify(likedAds));

    // Update DB
    const { data: existing } = await supabase
      .from("ad_stats")
      .select("id, likes")
      .eq("ad_id", adId)
      .maybeSingle();

    if (existing) {
      const newLikes = newLiked
        ? (existing.likes || 0) + 1
        : Math.max(0, (existing.likes || 0) - 1);
      await supabase
        .from("ad_stats")
        .update({ likes: newLikes })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("ad_stats")
        .insert({ ad_id: adId, views: 0, likes: newLiked ? 1 : 0 });
    }
  }, [adId]);

  return { ...stats, toggleLike };
}
