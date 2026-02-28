import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({ city: "", setCity: () => {} });

const CITY_STORAGE_KEY = "lamha_selected_city";

export const CityProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage immediately - no waiting for network
  const [city, setCityState] = useState(() => {
    return localStorage.getItem(CITY_STORAGE_KEY) || "";
  });
  const [initialized, setInitialized] = useState(!!city);

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem(CITY_STORAGE_KEY, newCity);
  };

  // Only fetch from DB if no saved city
  useEffect(() => {
    if (city) {
      setInitialized(true);
      return;
    }
    // No saved city - fetch first city from DB
    supabase
      .from("cities")
      .select("name")
      .order("sort_order")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCity(data[0].name);
        }
        setInitialized(true);
      });
  }, []);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
