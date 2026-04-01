import { createContext, useContext, useState, useEffect, ReactNode, startTransition } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateDeviceTokenLocation } from "@/lib/capacitor";

export type SelectionMode = "city" | "region";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
  selectionMode: SelectionMode;
  regionId: string;
  regionName: string;
  selectCity: (cityName: string) => void;
  selectRegion: (regionId: string, regionName: string) => void;
  /** When mode=region, list of city names in that region */
  regionCities: string[];
}

const CityContext = createContext<CityContextType>({
  city: "",
  setCity: () => {},
  selectionMode: "city",
  regionId: "",
  regionName: "",
  selectCity: () => {},
  selectRegion: () => {},
  regionCities: [],
});

const CITY_STORAGE_KEY = "lamha_selected_city";
const MODE_STORAGE_KEY = "lamha_selection_mode";
const REGION_ID_KEY = "lamha_region_id";
const REGION_NAME_KEY = "lamha_region_name";

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState(() => localStorage.getItem(CITY_STORAGE_KEY) || "");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(
    () => (localStorage.getItem(MODE_STORAGE_KEY) as SelectionMode) || "city"
  );
  const [regionId, setRegionId] = useState(() => localStorage.getItem(REGION_ID_KEY) || "");
  const [regionName, setRegionName] = useState(() => localStorage.getItem(REGION_NAME_KEY) || "");
  const [regionCities, setRegionCities] = useState<string[]>([]);

  const setCity = (newCity: string) => {
    localStorage.setItem(CITY_STORAGE_KEY, newCity);
    startTransition(() => setCityState(newCity));
  };

  const selectCity = (cityName: string) => {
    localStorage.setItem(MODE_STORAGE_KEY, "city");
    localStorage.setItem(CITY_STORAGE_KEY, cityName);
    localStorage.removeItem(REGION_ID_KEY);
    localStorage.removeItem(REGION_NAME_KEY);
    startTransition(() => {
      setSelectionMode("city");
      setCityState(cityName);
      setRegionId("");
      setRegionName("");
      setRegionCities([]);
    });
  };

  const selectRegion = (rId: string, rName: string) => {
    localStorage.setItem(MODE_STORAGE_KEY, "region");
    localStorage.setItem(REGION_ID_KEY, rId);
    localStorage.setItem(REGION_NAME_KEY, rName);
    localStorage.removeItem(CITY_STORAGE_KEY);
    startTransition(() => {
      setSelectionMode("region");
      setRegionId(rId);
      setRegionName(rName);
      setCityState("");
    });
  };

  // Fetch cities for selected region
  useEffect(() => {
    if (selectionMode !== "region" || !regionId) {
      setRegionCities([]);
      return;
    }
    supabase
      .from("cities")
      .select("name")
      .eq("region_id", regionId)
      .order("sort_order")
      .then(({ data }) => {
        setRegionCities((data || []).map((c) => c.name));
      });
  }, [selectionMode, regionId]);

  // On first launch: fetch default region/city
  useEffect(() => {
    const hasStored = localStorage.getItem(CITY_STORAGE_KEY) || localStorage.getItem(REGION_ID_KEY);
    if (hasStored) return;

    // Try to find default city
    supabase
      .from("cities")
      .select("name, region_id, regions(id, name)")
      .eq("is_default", true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const defaultCity = data[0] as any;
          selectCity(defaultCity.name);
          return;
        }
        // Try default region
        supabase
          .from("regions")
          .select("id, name")
          .eq("is_default", true)
          .limit(1)
          .then(({ data: rData }) => {
            if (rData && rData.length > 0) {
              selectRegion(rData[0].id, rData[0].name);
              return;
            }
            // Fallback: first city
            supabase
              .from("cities")
              .select("name")
              .order("sort_order")
              .limit(1)
              .then(({ data: cData }) => {
                if (cData && cData.length > 0) {
                  selectCity(cData[0].name);
                }
              });
          });
      });
  }, []);

  return (
    <CityContext.Provider
      value={{ city, setCity, selectionMode, regionId, regionName, selectCity, selectRegion, regionCities }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
