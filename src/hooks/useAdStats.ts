import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdStats {
  views: number;
  likes: number;
  liked: boolean;
}

const getStatsQueryKey = (adId: number) => ["ad_stats", adId] as const;

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
  const queryClient = useQueryClient();
  const liked = getLikedAds().includes(adId);

  const { data } = useQuery({
    queryKey: getStatsQueryKey(adId),
    enabled: adId > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_stats")
        .select("views, likes, fake_views")
        .eq("ad_id", adId)
        .maybeSingle();

      const fakeViews = (data as any)?.fake_views || 0;

      return {
        views: (data?.views || 0) + fakeViews,
        likes: data?.likes || 0,
      };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const stats: AdStats = {
    views: data?.views || 0,
    likes: data?.likes || 0,
    liked,
  };

  const toggleLike = useCallback(async () => {
    const likedAds = getLikedAds();
    const currentlyLiked = likedAds.includes(adId);
    const newLiked = !currentlyLiked;

    queryClient.setQueryData(getStatsQueryKey(adId), (prev?: { views: number; likes: number }) => ({
      views: prev?.views || 0,
      likes: newLiked ? (prev?.likes || 0) + 1 : Math.max(0, (prev?.likes || 0) - 1),
    }));

    if (newLiked) {
      likedAds.push(adId);
    } else {
      const idx = likedAds.indexOf(adId);
      if (idx > -1) likedAds.splice(idx, 1);
    }
    localStorage.setItem("lamha_liked", JSON.stringify(likedAds));

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
  }, [adId, queryClient]);

  return { ...stats, toggleLike };
}
