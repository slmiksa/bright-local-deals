import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/data/imageMap";
import { useRegionsWithCities, RegionWithCities } from "@/hooks/useRegions";

export interface AdMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Ad {
  id: number;
  images: string[];
  media: AdMedia[];
  shopName: string;
  offer: string;
  featured?: boolean;
  category: string;
  city: string;
  displayCity: string;
  phone: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  website: string;
}

export interface Section {
  id: string;
  title: string;
  ads: Ad[];
}

const categoryMap: Record<string, string> = {
  electronics: "اعلانات متاجر إلكترونيات",
  cafes: "اعلانات محال كافيهات",
  perfumes: "اعلانات محال العطور",
  furniture: "اعلانات محال المفروشات",
  food: "اعلانات المطاعم",
  events: "اعلانات محال الزينة والأفراح",
};

export { categoryMap };

interface DbAd {
  id: number;
  shop_name: string;
  offer: string;
  description: string | null;
  category: string;
  city: string;
  display_city: string | null;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  featured: boolean | null;
  website: string | null;
  ad_images: { image_url: string; sort_order: number | null; media_type?: string }[];
}

function mapDbAdToAd(dbAd: DbAd): Ad {
  const sortedMedia = [...(dbAd.ad_images || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  return {
    id: dbAd.id,
    images: sortedMedia.filter(m => (m.media_type || 'image') === 'image').map((img) => resolveImageUrl(img.image_url)),
    media: sortedMedia.map((m) => ({
      url: resolveImageUrl(m.image_url),
      type: (m.media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
    })),
    shopName: dbAd.shop_name,
    offer: dbAd.offer,
    featured: dbAd.featured || false,
    category: dbAd.category,
    city: dbAd.city,
    displayCity: dbAd.display_city || "",
    phone: dbAd.phone || "",
    description: dbAd.description || "",
    lat: dbAd.lat || 0,
    lng: dbAd.lng || 0,
    address: dbAd.address || "",
    website: dbAd.website || "",
  };
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

async function fetchAds(opts?: { city?: string; cities?: string[]; category?: string; featured?: boolean; regions?: RegionWithCities[] }): Promise<Ad[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from("ads")
    .select("*, display_city, ad_images(image_url, sort_order, media_type)")
    .eq("active", true)
    .lte("start_date", now)
    .order("created_at", { ascending: false });

  query = query.or(`end_date.is.null,end_date.gte.${now}`);

  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.featured) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw error;

  let ads = (data as unknown as DbAd[]).map(mapDbAdToAd);

  // Client-side city filtering to support comma-separated, "all", and "region:" values
  const userCities = opts?.cities?.length ? opts.cities : opts?.city ? [opts.city] : [];
  if (userCities.length > 0) {
    const regions = opts?.regions || [];
    ads = ads.filter(ad => matchesCity(ad.city, userCities, regions));
  }

  return ads;
}

async function fetchAdById(id: number): Promise<Ad | null> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(image_url, sort_order, media_type)")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapDbAdToAd(data as unknown as DbAd);
}

async function fetchCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("name")
    .order("sort_order");

  if (error) throw error;
  return data.map((c) => c.name);
}

// React Query hooks
export function useAdsByCity(city: string, options?: { enabled?: boolean; cities?: string[] }) {
  const { data: regions = [] } = useRegionsWithCities();
  const regionsKey = regions.map(r => r.id).join(",");
  const queryKey = options?.cities?.length
    ? ["ads", "byRegionCities", regionsKey, ...options.cities]
    : ["ads", "byCity", city, regionsKey];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const [ads, categoriesResult] = await Promise.all([
        fetchAds(options?.cities?.length ? { cities: options.cities, regions } : { city, regions }),
        supabase.from("categories").select("id, name").order("sort_order"),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      const categories = categoriesResult.data || [];

      const grouped: Record<string, Ad[]> = {};
      for (const cat of categories) {
        grouped[cat.id] = [];
      }
      for (const ad of ads) {
        if (!grouped[ad.category]) grouped[ad.category] = [];
        grouped[ad.category].push(ad);
      }

      const sections: Section[] = categories.map((cat) => ({
        id: cat.id,
        title: cat.name,
        ads: grouped[cat.id] || [],
      }));

      return sections;
    },
    enabled: (options?.enabled ?? true) && (!!city || (options?.cities?.length ?? 0) > 0),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useFeaturedAds(city: string, cities?: string[]) {
  const { data: regions = [] } = useRegionsWithCities();
  return useQuery({
    queryKey: cities?.length ? ["ads", "featured", "region", regions.length, ...cities] : ["ads", "featured", city, regions.length],
    queryFn: () => fetchAds(cities?.length ? { cities, featured: true, regions } : { city, featured: true, regions }),
    enabled: !!city || (cities?.length ?? 0) > 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAdsByCategory(category: string, city: string, cities?: string[]) {
  const { data: regions = [] } = useRegionsWithCities();
  return useQuery({
    queryKey: cities?.length ? ["ads", "category", category, "region", regions.length, ...cities] : ["ads", "category", category, city, regions.length],
    queryFn: () => fetchAds(cities?.length ? { cities, category, regions } : { city, category, regions }),
    enabled: !!city || (cities?.length ?? 0) > 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAdById(id: number) {
  return useQuery({
    queryKey: ["ads", "detail", id],
    queryFn: () => fetchAdById(id),
    enabled: id > 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useEventAds(city: string, cities?: string[]) {
  const { data: regions = [] } = useRegionsWithCities();
  return useQuery({
    queryKey: cities?.length ? ["ads", "events", "region", regions.length, ...cities] : ["ads", "events", city, regions.length],
    queryFn: () => fetchAds(cities?.length ? { cities, category: "events", regions } : { city, category: "events", regions }),
    enabled: !!city || (cities?.length ?? 0) > 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
