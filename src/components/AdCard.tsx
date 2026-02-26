import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";

interface AdCardProps {
  id: number;
  image: string;
  shopName: string;
  offer: string;
  featured?: boolean;
}

const AdCard = ({ id, image, shopName, offer, featured }: AdCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-card rounded-2xl overflow-hidden shadow-card active:scale-[0.97] transition-transform cursor-pointer ${
        featured ? "gold-border" : ""
      }`}
      onClick={() => navigate(`/ad/${id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={shopName} className="w-full h-full object-cover" loading="lazy" />
        {featured && (
          <span className="absolute top-2 right-2 bg-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-card">
            ⭐ مميز
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-[13px] text-foreground truncate">{shopName}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{offer}</p>
        <button
          className="touch-target mt-2.5 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-[12px] font-bold active:scale-[0.97] transition-transform"
          onClick={(e) => { e.stopPropagation(); navigate(`/ad/${id}`); }}
        >
          <Phone className="w-3.5 h-3.5" />
          تفاصيل
        </button>
      </div>
    </div>
  );
};

export default AdCard;
