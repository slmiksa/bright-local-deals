import { createContext, useContext, useState, ReactNode } from "react";

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({ city: "الرياض", setCity: () => {} });

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState("الرياض");
  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
