import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Phone, MapPin, Clock, Star, Share2, Images } from "lucide-react";
import { getAdById } from "@/data/ads";
import { useState, useRef } from "react";
import ImageLightbox from "@/components/ImageLightbox";

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ad = getAdById(Number(id));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!ad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-[430px] mx-auto">
        <div className="text-center p-8">
          <p className="text-muted-foreground text-lg">الإعلان غير موجود</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary font-bold">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth;
    setImgIndex(Math.round(Math.abs(el.scrollLeft) / cardWidth));
  };

  const mapUrl = `https://www.google.com/maps?q=${ad.lat},${ad.lng}&z=15&output=embed`;

  return (
    <div className="min-h-screen bg-background pb-8 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="touch-target w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-muted transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-[15px] font-bold text-foreground">{ad.shopName}</h1>
          <button className="touch-target w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-muted transition-colors">
            <Share2 className="w-[18px] h-[18px] text-foreground" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          dir="ltr"
        >
          {ad.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${ad.shopName} ${i + 1}`}
              className="w-full h-full object-cover shrink-0 snap-center cursor-pointer"
              onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
            />
          ))}
        </div>

        {ad.featured && (
          <span className="absolute top-3 right-3 bg-gold text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-xl shadow-elevated flex items-center gap-1 pointer-events-none">
            <Star className="w-3 h-3" /> مميز
          </span>
        )}

        {ad.images.length > 1 && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {ad.images.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-5 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50"}`} />
              ))}
            </div>
            <div className="absolute top-3 left-3 bg-foreground/50 backdrop-blur-sm text-primary-foreground text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
              <Images className="w-3 h-3" />
              {imgIndex + 1}/{ad.images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {ad.images.length > 1 && (
        <div className="flex gap-2 px-5 mt-3 overflow-x-auto hide-scrollbar">
          {ad.images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === imgIndex ? "border-primary" : "border-transparent opacity-60"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="px-5 pt-5">
        <h2 className="text-xl font-bold text-foreground">{ad.shopName}</h2>
        <p className="text-primary font-semibold text-[14px] mt-1">{ad.offer}</p>
        
        <div className="flex items-center gap-2 mt-3 text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-[13px]">{ad.address}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-[13px]">متاح الآن</span>
        </div>

        <div className="mt-5 p-4 bg-card rounded-2xl shadow-card">
          <h3 className="font-bold text-[14px] text-foreground mb-2">عن المتجر</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{ad.description}</p>
        </div>

        {/* Map */}
        <div className="mt-5 rounded-2xl overflow-hidden shadow-card bg-card">
          <div className="p-4 pb-2">
            <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> الموقع على الخريطة
            </h3>
          </div>
          <div className="aspect-[16/9] w-full">
            <iframe src={mapUrl} className="w-full h-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="موقع المتجر" />
          </div>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${ad.lat},${ad.lng}`} target="_blank" rel="noopener noreferrer" className="block text-center text-primary font-semibold text-[13px] py-3 active:bg-secondary transition-colors">
            فتح في خرائط قوقل ↗
          </a>
        </div>

        {/* Contact */}
        <div className="mt-5 flex gap-3">
          <a href={`tel:${ad.phone}`} className="touch-target flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold text-[14px] active:scale-[0.97] transition-transform shadow-elevated">
            <Phone className="w-5 h-5" /> اتصل الآن
          </a>
          <a href={`https://wa.me/966${ad.phone.slice(1)}`} target="_blank" rel="noopener noreferrer" className="touch-target w-14 h-14 flex items-center justify-center bg-[hsl(142_70%_45%)] text-primary-foreground rounded-2xl active:scale-[0.97] transition-transform shadow-card">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.603-1.209A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.314 0-4.458-.766-6.184-2.06l-.432-.328-2.836.745.758-2.77-.36-.57A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </a>
        </div>
        <p className="text-center text-muted-foreground text-[12px] mt-3 mb-2">{ad.phone}</p>
      </div>

      {lightboxOpen && (
        <ImageLightbox images={ad.images} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
};

export default AdDetail;
