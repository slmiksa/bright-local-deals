import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCities } from "@/hooks/useAds";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({ city: "", setCity: () => {} });

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState("");
  const { data: cities } = useCities();

  useEffect(() => {
    if (cities && cities.length > 0 && !city) {
      setCity(cities[0]);
    }
  }, [cities, city]);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
