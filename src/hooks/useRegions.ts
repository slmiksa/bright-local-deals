import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RegionWithCities {
  id: string;
  name: string;
  sort_order: number | null;
  is_default: boolean;
  cities: { id: string; name: string; sort_order: number | null; is_default: boolean }[];
}

export function useRegionsWithCities() {
  return useQuery({
    queryKey: ["regions-with-cities"],
    queryFn: async (): Promise<RegionWithCities[]> => {
      const [regionsRes, citiesRes] = await Promise.all([
        supabase.from("regions").select("*").order("sort_order"),
        supabase.from("cities").select("*").order("sort_order"),
      ]);

      if (regionsRes.error) throw regionsRes.error;
      if (citiesRes.error) throw citiesRes.error;

      const regions = regionsRes.data || [];
      const cities = citiesRes.data || [];

      return regions.map((r) => ({
        id: r.id,
        name: r.name,
        sort_order: r.sort_order,
        is_default: r.is_default,
        cities: cities
          .filter((c) => c.region_id === r.id)
          .map((c) => ({ id: c.id, name: c.name, sort_order: c.sort_order, is_default: c.is_default })),
      }));
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
