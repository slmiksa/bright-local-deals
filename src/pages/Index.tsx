import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import AdSection from "@/components/AdSection";
import { getAdsByCity } from "@/data/ads";
import { useCity } from "@/contexts/CityContext";

const Index = () => {
  const { city } = useCity();
  const sections = getAdsByCity(city);

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto relative">
      <TopBar />
      <FeaturedSlider />
      <CategoriesRow />
      {sections.map((section) => (
        <AdSection key={section.id} {...section} />
      ))}
      {sections.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-[15px]">لا توجد إعلانات في {city} حالياً</p>
        </div>
      )}
      <div className="h-8" />
    </div>
  );
};

export default Index;
