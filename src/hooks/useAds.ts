import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/data/imageMap";

export interface Ad {
  id: number;
  images: string[];
  shopName: string;
  offer: string;
  featured?: boolean;
  category: string;
  city: string;
  phone: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
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
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  featured: boolean | null;
  ad_images: { image_url: string; sort_order: number | null }[];
}

function mapDbAdToAd(dbAd: DbAd): Ad {
  const sortedImages = [...(dbAd.ad_images || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  return {
    id: dbAd.id,
    images: sortedImages.map((img) => resolveImageUrl(img.image_url)),
    shopName: dbAd.shop_name,
    offer: dbAd.offer,
    featured: dbAd.featured || false,
    category: dbAd.category,
    city: dbAd.city,
    phone: dbAd.phone || "",
    description: dbAd.description || "",
    lat: dbAd.lat || 0,
    lng: dbAd.lng || 0,
    address: dbAd.address || "",
  };
}

async function fetchAds(city?: string, category?: string, featured?: boolean): Promise<Ad[]> {
  let query = supabase
    .from("ads")
    .select("*, ad_images(image_url, sort_order)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (city) query = query.eq("city", city);
  if (category) query = query.eq("category", category);
  if (featured) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as DbAd[]).map(mapDbAdToAd);
}

async function fetchAdById(id: number): Promise<Ad | null> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(image_url, sort_order)")
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
export function useAdsByCity(city: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["ads", "byCity", city],
    queryFn: async () => {
      const [ads, categoriesResult] = await Promise.all([
        fetchAds(city),
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
    enabled: (options?.enabled ?? true) && !!city,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useFeaturedAds(city: string) {
  return useQuery({
    queryKey: ["ads", "featured", city],
    queryFn: () => fetchAds(city, undefined, true),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useAdsByCategory(category: string, city: string) {
  return useQuery({
    queryKey: ["ads", "category", category, city],
    queryFn: () => fetchAds(city, category),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useAdById(id: number) {
  return useQuery({
    queryKey: ["ads", "detail", id],
    queryFn: () => fetchAdById(id),
    enabled: id > 0,
  });
}

export function useEventAds(city: string) {
  return useQuery({
    queryKey: ["ads", "events", city],
    queryFn: () => fetchAds(city, "events"),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
