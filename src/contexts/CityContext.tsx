import { createContext, useContext, useState, useEffect, ReactNode, startTransition } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({ city: "", setCity: () => {} });

const CITY_STORAGE_KEY = "lamha_selected_city";

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState(() => localStorage.getItem(CITY_STORAGE_KEY) || "");

  const setCity = (newCity: string) => {
    localStorage.setItem(CITY_STORAGE_KEY, newCity);
    startTransition(() => {
      setCityState(newCity);
    });
  };

  useEffect(() => {
    if (city) return;

    supabase
      .from("cities")
      .select("name")
      .order("sort_order")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCity(data[0].name);
        }
      });
  }, []);

  return <CityContext.Provider value={{ city, setCity }}>{children}</CityContext.Provider>;
};

export const useCity = () => useContext(CityContext);

