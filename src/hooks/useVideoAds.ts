import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/data/imageMap";

export interface VideoAd {
  adId: number;
  shopName: string;
  videoUrl: string;
  offer: string;
}

async function fetchVideoAds(city?: string): Promise<VideoAd[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from("ads")
    .select("id, shop_name, offer, city, ad_images(image_url, sort_order, media_type)")
    .eq("active", true)
    .lte("start_date", now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("created_at", { ascending: false });

  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error) throw error;

  const results: VideoAd[] = [];
  for (const ad of data as any[]) {
    const videos = (ad.ad_images || [])
      .filter((m: any) => m.media_type === "video")
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

    for (const vid of videos) {
      results.push({
        adId: ad.id,
        shopName: ad.shop_name,
        videoUrl: resolveImageUrl(vid.image_url),
        offer: ad.offer,
      });
    }
  }
  return results;
}

export function useVideoAds(city: string) {
  return useQuery({
    queryKey: ["videoAds", city],
    queryFn: () => fetchVideoAds(city),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}
