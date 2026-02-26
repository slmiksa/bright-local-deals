import { Phone } from "lucide-react";

interface AdCardProps {
  image: string;
  shopName: string;
  offer: string;
  featured?: boolean;
}

const AdCard = ({ image, shopName, offer, featured }: AdCardProps) => {
  return (
    <div
      className={`bg-card rounded-2xl overflow-hidden shadow-card ${
        featured ? "gold-border" : ""
      }`}
    >
      <div className="relative aspect-square">
        <img src={image} alt={shopName} className="w-full h-full object-cover" />
        {featured && (
          <span className="absolute top-2 right-2 bg-gold text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">
            مميز
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground truncate">{shopName}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{offer}</p>
        <button className="touch-target mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-semibold">
          <Phone className="w-3.5 h-3.5" />
          اتصل
        </button>
      </div>
    </div>
  );
};

export default AdCard;
