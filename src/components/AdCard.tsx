import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Images } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

interface AdCardProps {
  id: number;
  images: string[];
  shop_name: string;
  offer: string;
  featured?: boolean;
}

const AdCard = ({ id, images, shop_name, offer, featured }: AdCardProps) => {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth;
    const index = Math.round(el.scrollLeft / cardWidth);
    setImgIndex(Math.abs(index));
  };

  return (
    <>
      <div
        className={`bg-card rounded-2xl overflow-hidden shadow-card active:scale-[0.97] transition-transform ${
          featured ? "gold-border" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {images.length > 1 ? (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              dir="ltr"
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${shop_name} ${i + 1}`}
                  className="w-full h-full object-cover shrink-0 snap-center cursor-pointer"
                  loading="lazy"
                  onClick={() => { setImgIndex(i); setLightboxOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <img
              src={images[0]}
              alt={shop_name}
              className="w-full h-full object-cover cursor-pointer"
              loading="lazy"
              onClick={() => { setImgIndex(0); setLightboxOpen(true); }}
            />
          )}

          {featured && (
            <span className="absolute top-2 right-2 bg-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-card pointer-events-none">
              ⭐ مميز
            </span>
          )}

          {images.length > 1 && (
            <>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === imgIndex ? "w-3 bg-primary-foreground" : "w-1 bg-primary-foreground/50"
                    }`}
                  />
                ))}
              </div>
              <div className="absolute top-2 left-2 bg-foreground/50 backdrop-blur-sm text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 pointer-events-none">
                <Images className="w-2.5 h-2.5" />
                {images.length}
              </div>
            </>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-[13px] text-foreground truncate">{shop_name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{offer}</p>
          <button
            className="touch-target mt-2.5 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-[12px] font-bold active:scale-[0.97] transition-transform"
            onClick={() => navigate(`/ad/${id}`)}
          >
            <Phone className="w-3.5 h-3.5" />
            تفاصيل
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox images={images} initialIndex={imgIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
};

export default AdCard;
