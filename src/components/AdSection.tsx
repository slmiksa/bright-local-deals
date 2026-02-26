import AdCard from "./AdCard";
import { ChevronLeft } from "lucide-react";

interface Ad {
  id: number;
  image: string;
  shopName: string;
  offer: string;
  featured?: boolean;
}

interface AdSectionProps {
  id: string;
  title: string;
  ads: Ad[];
}

const AdSection = ({ id, title, ads }: AdSectionProps) => {
  return (
    <section id={id} className="pt-7">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-bold text-base text-foreground">{title}</h2>
        <button className="touch-target flex items-center gap-0.5 text-[13px] font-semibold text-primary active:opacity-70 transition-opacity">
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
