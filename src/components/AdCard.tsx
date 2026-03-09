import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Images, Eye, Heart, Play } from "lucide-react";
import ImageLightbox from "./ImageLightbox";
import { useAdStats } from "@/hooks/useAdStats";
import { AdMedia } from "@/hooks/useAds";

interface AdCardProps {
  id: number;
  images: string[];
  media?: AdMedia[];
  shopName: string;
  offer: string;
  featured?: boolean;
}

const AdCard = ({ id, images, media = [], shopName, offer, featured }: AdCardProps) => {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { views, likes, liked, toggleLike } = useAdStats(id);

  // Use media array if available, fallback to images
  const mediaItems = media.length > 0 ? media : images.map(url => ({ url, type: 'image' as const }));
  const lightboxImages = images.length > 0 ? images : mediaItems.filter(m => m.type === 'image').map(m => m.url);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth;
    const index = Math.round(el.scrollLeft / cardWidth);
    setImgIndex(Math.abs(index));
  };

  const renderMediaItem = (m: AdMedia, i: number) => {
    if (m.type === 'video') {
      return (
        <div key={i} className="w-full h-full shrink-0 snap-center relative cursor-pointer" onClick={() => navigate(`/ad/${id}`)}>
          <video src={m.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 pointer-events-none">
            <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground drop-shadow-lg" />
          </div>
        </div>
      );
    }
    return (
      <img
        key={i}
        src={m.url}
        alt={`${shopName} ${i + 1}`}
        className="w-full h-full object-cover shrink-0 snap-center cursor-pointer"
        loading="lazy"
        onClick={() => { setImgIndex(i); setLightboxOpen(true); }}
      />
    );
  };

  return (
    <>
      <div
        className={`bg-card rounded-2xl overflow-hidden shadow-card active:scale-[0.97] transition-transform ${
          featured ? "gold-border" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {mediaItems.length > 1 ? (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              dir="ltr"
            >
              {mediaItems.map((m, i) => renderMediaItem(m, i))}
            </div>
          ) : mediaItems.length === 1 ? (
            renderMediaItem(mediaItems[0], 0)
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">لا توجد صور</span>
            </div>
          )}

          {featured && (
            <span className="absolute top-2 right-2 bg-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-card pointer-events-none">
              ⭐ مميز
            </span>
          )}

          {mediaItems.length > 1 && (
            <>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                {mediaItems.map((_, i) => (
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
                {mediaItems.length}
              </div>
            </>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-[13px] text-foreground truncate">{shopName}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{offer}</p>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Eye className="w-3.5 h-3.5" /> {views}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} /> {likes}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(); }}
              className="touch-target w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
            >
              <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          </div>

          <button
            className="touch-target mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-[12px] font-bold active:scale-[0.97] transition-transform"
            onClick={() => navigate(`/ad/${id}`)}
          >
            <Phone className="w-3.5 h-3.5" />
            تفاصيل
          </button>
        </div>
      </div>

      {lightboxOpen && lightboxImages.length > 0 && (
        <ImageLightbox images={lightboxImages} initialIndex={imgIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
};

export default AdCard;
