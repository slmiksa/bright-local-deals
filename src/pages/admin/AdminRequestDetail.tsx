import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star, Sparkles, MapPin, Store, Tag, DollarSign, Clock, Image as ImageIcon, Play, Phone, Download, Map, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { useRegionsWithCities } from "@/hooks/useRegions";

const forceDownload = async (url: string, filename: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};

const AdminRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { data: regions = [] } = useRegionsWithCities();

  const { data: request, isLoading } = useQuery({
    queryKey: ["admin-request-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_requests")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: images = [] } = useQuery({
    queryKey: ["admin-request-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_request_images")
        .select("*")
        .eq("request_id", id!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        الطلب غير موجود
      </div>
    );
  }

  const mainImage = images.find((img) => img.is_main);
  const extraImages = images.filter((img) => !img.is_main);
  const allImageUrls = images.map((img) => img.image_url);

  const statusLabels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
  };

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/requests")} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">طلب #{request.order_number}</h1>
          <p className="text-[12px] text-muted-foreground">
            {new Date(request.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Info cards */}
      {(() => {
        const regionForCity = regions.find(r => r.cities.some(c => c.name === request.city));
        return (
          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={Store} label="اسم المتجر" value={request.store_name} copyable />
            <InfoCard icon={Tag} label="نوع الإعلان" value={request.ad_type} />
            <InfoCard icon={request.ad_tier === "متميز" ? Sparkles : Star} label="فئة الإعلان" value={request.ad_tier} />
            <InfoCard icon={Map} label="المنطقة" value={regionForCity?.name || "غير محددة"} />
            <InfoCard icon={MapPin} label="المدينة" value={request.city} />
            <InfoCard icon={Phone} label="رقم التواصل" value={(request as any).phone || "غير محدد"} copyable />
            <InfoCard icon={DollarSign} label="السعر" value={`${request.total_price} ريال`} highlight />
            <InfoCard icon={Clock} label="الحالة" value={statusLabels[request.status] || request.status} />
          </div>
        );
      })()}

      {/* Description */}
      {(request as any).description && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-[13px] font-bold text-foreground mb-2">نبذة عن الإعلان</h2>
          <p className="text-[13px] text-muted-foreground whitespace-pre-line leading-relaxed">{(request as any).description}</p>
        </div>
      )}

      {/* Download all button */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-foreground">الوسائط ({images.length})</h2>
          <button
            onClick={() => {
              images.forEach((img, i) => {
                const ext = (img as any).media_type === 'video' ? 'mp4' : 'jpg';
                forceDownload(img.image_url, `${request.order_number}_${i + 1}.${ext}`);
              });
            }}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline"
          >
            <Download className="w-4 h-4" />
            تحميل الكل
          </button>
        </div>
      )}

      {/* Main media */}
      {mainImage && (
        <div>
          <h2 className="text-[14px] font-bold text-foreground mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-primary" /> {(mainImage as any).media_type === 'video' ? 'فيديو الغلاف' : 'صورة الغلاف'}
          </h2>
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary">
            <div onClick={() => (mainImage as any).media_type !== 'video' && setLightboxIndex(0)} className="cursor-pointer">
              {(mainImage as any).media_type === 'video' ? (
                <video src={mainImage.image_url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={mainImage.image_url} alt="صورة الغلاف" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={() => forceDownload(mainImage.image_url, `${request.order_number}_cover.${(mainImage as any).media_type === 'video' ? 'mp4' : 'jpg'}`)}
              className="absolute top-2 left-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Extra images */}
      {extraImages.length > 0 && (
        <div>
          <h2 className="text-[14px] font-bold text-foreground mb-2">وسائط إضافية ({extraImages.length})</h2>
          <div className="grid grid-cols-3 gap-2">
            {extraImages.map((img, i) => (
              <div
                key={img.id}
                className="aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity relative"
              >
                <div
                  className="cursor-pointer w-full h-full"
                  onClick={() => (img as any).media_type !== 'video' && setLightboxIndex(i + (mainImage ? 1 : 0))}
                >
                  {(img as any).media_type === 'video' ? (
                    <>
                      <video src={img.image_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 pointer-events-none">
                        <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <img src={img.image_url} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                </div>
                <button
                  onClick={() => forceDownload(img.image_url, `${request.order_number}_${i + 1}.${(img as any).media_type === 'video' ? 'mp4' : 'jpg'}`)}
                  className="absolute top-1 left-1 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location map */}
      {(request as any).lat && (request as any).lng && (
        <div>
          <h2 className="text-[14px] font-bold text-foreground mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" /> الموقع على الخريطة
          </h2>
          <div className="rounded-2xl overflow-hidden border border-border">
            <iframe
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAR1EIyv5LLAB5x0S5WKVupz8TXSBH08oo&q=${(request as any).lat},${(request as any).lng}&zoom=15`}
            />
          </div>
          <a
            href={`https://www.google.com/maps?q=${(request as any).lat},${(request as any).lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:underline mt-2"
          >
            <MapPin className="w-3.5 h-3.5" /> فتح في خرائط Google
          </a>
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={allImageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

function InfoCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className={`text-[14px] font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default AdminRequestDetail;
