import { useNavigate } from "react-router-dom";
import AdCard from "./AdCard";
import { ChevronLeft, Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper } from "lucide-react";
import { Ad } from "@/data/ads";

const categoryIcons: Record<string, React.ElementType> = {
  electronics: Smartphone,
  cafes: CupSoda,
  perfumes: SprayCan,
  furniture: Lamp,
  food: ChefHat,
  events: PartyPopper,
};

interface AdSectionProps {
  id: string;
  title: string;
  ads: Ad[];
}

const AdSection = ({ id, title, ads }: AdSectionProps) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[id];

  return (
    <section id={id} className="pt-7">
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <h2 className="font-bold text-base text-foreground">{title}</h2>
        </div>
        <button
          onClick={() => navigate(`/category/${id}`)}
          className="touch-target flex items-center gap-0.5 text-[13px] font-semibold text-primary active:opacity-70 transition-opacity"
        >
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div
        className="flex gap-3 overflow-x-auto px-5 hide-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="shrink-0 w-[44%]">
            <AdCard {...ad} />
          </div>
        ))}
        <div className="shrink-0 w-2" />
      </div>
    </section>
  );
};

export default AdSection;
