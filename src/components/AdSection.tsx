import AdCard from "./AdCard";

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
    <section id={id} className="pt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
        <button className="touch-target text-sm font-semibold text-primary">
          عرض الكل
        </button>
      </div>
      <div
        className="flex gap-3 overflow-x-auto px-4"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="shrink-0 w-[42%]">
            <AdCard {...ad} />
          </div>
        ))}
        <div className="shrink-0 w-1" />
      </div>
    </section>
  );
};

export default AdSection;
