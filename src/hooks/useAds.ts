import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdRow } from "@/types/database";

export type Ad = AdRow;

export interface Section {
  id: string;
  title: string;
  ads: Ad[];
}

export const categoryMap: Record<string, string> = {
  electronics: "💻 إلكترونيات",
  cafes: "☕ كافيهات",
  perfumes: "🌸 عطور وروائح",
  furniture: "🛋 مفروشات",
  food: "🍔 مأكولات",
  events: "💍 أفراح ومناسبات",
};

export function useAdsByCity(city: string) {
  return useQuery({
    queryKey: ["ads", "city", city],
    queryFn: async (): Promise<Section[]> => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("city", city)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const ads = (data || []) as Ad[];
      const grouped: Record<string, Ad[]> = {};
      for (const ad of ads) {
        if (!grouped[ad.category]) grouped[ad.category] = [];
        grouped[ad.category].push(ad);
      }
      return Object.entries(grouped).map(([id, ads]) => ({
        id,
        title: categoryMap[id] || id,
        ads,
      }));
    },
  });
}

export function useFeaturedAds(city: string) {
  return useQuery({
    queryKey: ["ads", "featured", city],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("city", city)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as Ad[];
    },
  });
}

export function useAdById(id: number) {
  return useQuery({
    queryKey: ["ads", "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Ad;
    },
  });
}

export function useAdsByCategory(category: string, city: string) {
  return useQuery({
    queryKey: ["ads", "category", category, city],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("category", category)
        .eq("city", city)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Ad[];
    },
  });
}

export function useEventAds(city: string) {
  return useQuery({
    queryKey: ["ads", "events", city],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("category", "events")
        .eq("city", city)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Ad[];
    },
  });
}
