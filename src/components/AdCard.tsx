import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Images, Eye, Heart, MapPin, ChevronLeft } from "lucide-react";
import ImageLightbox from "./ImageLightbox";
import VideoThumbnail from "./VideoThumbnail";
import { useAdStats } from "@/hooks/useAdStats";
import { AdMedia } from "@/hooks/useAds";

interface AdCardProps {
  id: number;
  images: string[];
  media?: AdMedia[];
  shopName: string;
  offer: string;
  featured?: boolean;
  city?: string;
  displayCity?: string;
  showCity?: boolean;
  onOpen?: () => void;
}

const AdCard = ({ id, images, media = [], shopName, offer, featured, city, displayCity, showCity, onOpen }: AdCardProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { views, likes, liked, toggleLike } = useAdStats(id);

  const mediaItems = media.length > 0 ? media : images.map(url => ({ url, type: 'image' as const }));
  const lightboxImages = images.length > 0 ? images : mediaItems.filter(m => m.type === 'image').map(m => m.url);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth;
    const index = Math.round(el.scrollLeft / cardWidth);
    setImgIndex(Math.abs(index));
  };

  const openAd = () => {
    onOpen?.();

    try {
      const raw = sessionStorage.getItem("lamha_scroll_positions") || "{}";
      const positions = JSON.parse(raw) as Record<string, number>;
      positions[pathname] = window.scrollY || 0;
      sessionStorage.setItem("lamha_scroll_positions", JSON.stringify(positions));
    } catch {
      // Ignore storage errors
    }

    navigate(`/ad/${id}`);
  };

  const renderMediaItem = (m: AdMedia, i: number) => {
    if (m.type === 'video') {
      return (
        <VideoThumbnail
          key={i}
          src={m.url}
          alt={`${shopName} فيديو`}
          className="w-full h-full shrink-0 snap-center"
          onClick={openAd}
        />
      );
    }
    return (
      <img
        key={i}
        src={m.url}
        alt={`${shopName} ${i + 1}`}
        className="w-full h-full object-cover shrink-0 snap-center cursor-pointer"
        loading="lazy"
        onClick={openAd}
      />
    );
  };

  return (
    <>
      <div
        className={`bg-card rounded-2xl overflow-hidden transition-all duration-200 ${
          featured
            ? "gold-border shadow-[0_4px_24px_-4px_hsla(var(--gold)/0.2)]"
            : "shadow-card hover:shadow-elevated"
        }`}
      >
        {/* Image Section */}
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
            <span className="absolute top-2 right-2 bg-[hsl(var(--gold))] text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md pointer-events-none flex items-center gap-1">
              ⭐ مميز
            </span>
          )}

          {mediaItems.length > 1 && (
            <>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                {mediaItems.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === imgIndex ? "w-4 h-1.5 bg-primary-foreground" : "w-1.5 h-1.5 bg-primary-foreground/50"
                    }`}
                  />
                ))}
              </div>
              <div className="absolute top-2 left-2 bg-foreground/60 backdrop-blur-md text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 pointer-events-none">
                <Images className="w-3 h-3" />
                {mediaItems.length}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 space-y-1.5">
          <div>
            <h3 className="font-bold text-sm text-foreground truncate leading-tight">{shopName}</h3>
            {(displayCity || (showCity && city)) && (
              <p className="text-[11px] text-muted-foreground truncate flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                {displayCity || city}
              </p>
            )}
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate leading-relaxed">{offer}</p>
          </div>

          {/* Stats + Like */}
          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Eye className="w-3.5 h-3.5" /> {views}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground active:scale-90 transition-transform"
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${liked ? "fill-destructive text-destructive" : ""}`} /> {likes}
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-[12px] font-bold active:scale-[0.97] transition-transform"
            onClick={openAd}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
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
