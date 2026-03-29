import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/data/imageMap";
import { useRegionsWithCities, RegionWithCities } from "@/hooks/useRegions";

export interface VideoAd {
  adId: number;
  shopName: string;
  videoUrl: string;
  offer: string;
}

function matchesCity(adCity: string, userCities: string[], regions: RegionWithCities[]): boolean {
  if (!adCity || adCity === "all") return true;
  if (adCity.startsWith("region:")) {
    const rName = adCity.replace("region:", "");
    const region = regions.find(r => r.name === rName);
    if (!region) return false;
    const rCityNames = region.cities.map(c => c.name);
    return userCities.some(uc => rCityNames.includes(uc));
  }
  const adCities = adCity.split(",").map(c => c.trim());
  return userCities.some(uc => adCities.includes(uc));
}

async function fetchVideoAds(opts?: { city?: string; cities?: string[]; regions?: RegionWithCities[] }): Promise<VideoAd[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from("ads")
    .select("id, shop_name, offer, city, ad_images(image_url, sort_order, media_type)")
    .eq("active", true)
    .lte("start_date", now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  const userCities = opts?.cities?.length ? opts.cities : opts?.city ? [opts.city] : [];
  const regions = opts?.regions || [];
  const filtered = userCities.length > 0
    ? (data as any[]).filter(ad => matchesCity(ad.city, userCities, regions))
    : (data as any[]);

  const results: VideoAd[] = [];
  for (const ad of filtered) {
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

export function useVideoAds(city: string, cities?: string[]) {
  const { data: regions = [] } = useRegionsWithCities();
  return useQuery({
    queryKey: cities?.length ? ["videoAds", "region", ...cities] : ["videoAds", city],
    queryFn: () => fetchVideoAds(cities?.length ? { cities, regions } : { city, regions }),
    enabled: !!city || (cities?.length ?? 0) > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}
