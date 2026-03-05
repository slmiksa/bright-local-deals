import { useState, useMemo, useRef } from "react";
import { Send, Store, PartyPopper, ChefHat, ArrowRight, Sparkles, Star, ImagePlus, X, Camera, Loader2, CheckCircle, Mail, Video, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useCities } from "@/hooks/useAds";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  sort_order: number | null;
};

type SurchargeSettings = {
  featured_surcharge: number;
  featured_surcharge_enabled: boolean;
  whatsapp_number: string;
};

const getPlanIcon = (name: string) => {
  if (name.includes("أفراح") || name.includes("مناسبات") || name.includes("زينة")) return PartyPopper;
  if (name.includes("أسر") || name.includes("مطاعم") || name.includes("كافيه")) return ChefHat;
  return Store;
};

const cardStyles = [
  { color: "from-primary/20 to-primary/5", border: "border-primary/30" },
  { color: "from-accent/20 to-accent/5", border: "border-accent/30" },
  { color: "from-secondary/40 to-secondary/10", border: "border-border" },
];

const AddAdPage = () => {
  const navigate = useNavigate();
  const { data: cities = [] } = useCities();
  const { data: pricingPlans = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["ad-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_pricing")
        .select("id, name, description, price, duration_days, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as PricingPlan[];
    },
  });

  const { data: surchargeSettings } = useQuery({
    queryKey: ["featured-surcharge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("featured_surcharge, featured_surcharge_enabled, whatsapp_number")
        .eq("id", "default")
        .single();
      if (error) throw error;
      return data as SurchargeSettings;
    },
  });

  const featuredExtra = surchargeSettings?.featured_surcharge ?? 50;
  const featuredEnabled = surchargeSettings?.featured_surcharge_enabled ?? true;
  const whatsappNumber = surchargeSettings?.whatsapp_number ?? "966500000000";

  const adTypes = useMemo(() => pricingPlans.map((plan) => plan.name), [pricingPlans]);
  const [adType, setAdType] = useState("");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [adTier, setAdTier] = useState<"عادي" | "متميز">("عادي");
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mainMedia, setMainMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' } | null>(null);
  const [extraImages, setExtraImages] = useState<{ file: File; preview: string }[]>([]);
  const [extraVideo, setExtraVideo] = useState<{ file: File; preview: string } | null>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mainVideoInputRef = useRef<HTMLInputElement>(null);

  const selectedPlan = useMemo(
    () => pricingPlans.find((plan) => plan.name === adType) || null,
    [pricingPlans, adType]
  );

  const totalPrice = useMemo(() => {
    if (!selectedPlan) return null;
    return adTier === "متميز" && featuredEnabled ? selectedPlan.price + featuredExtra : selectedPlan.price;
  }, [selectedPlan, adTier, featuredExtra, featuredEnabled]);

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainMedia) URL.revokeObjectURL(mainMedia.preview);
    setMainMedia({ file, preview: URL.createObjectURL(file), type: 'image' });
  };

  const handleMainVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "تنبيه", description: "حجم الفيديو يجب أن لا يتجاوز 50 ميقا", variant: "destructive" });
      return;
    }
    if (mainMedia) URL.revokeObjectURL(mainMedia.preview);
    setMainMedia({ file, preview: URL.createObjectURL(file), type: 'video' });
  };

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files)
      .slice(0, 10 - extraImages.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setExtraImages((prev) => [...prev, ...newImages]);
  };

  const handleExtraVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "تنبيه", description: "حجم الفيديو يجب أن لا يتجاوز 50 ميقا", variant: "destructive" });
      return;
    }
    if (extraVideo) URL.revokeObjectURL(extraVideo.preview);
    setExtraVideo({ file, preview: URL.createObjectURL(file) });
  };

  const removeExtraImage = (index: number) => {
    setExtraImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImage = async (file: File, requestId: string, index: number) => {
    const ext = file.name.split(".").pop();
    const path = `${requestId}/${index}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ad-request-images").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("ad-request-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const uploadVideo = async (file: File, requestId: string, index: number) => {
    const ext = file.name.split(".").pop();
    const path = `${requestId}/${index}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ad-request-videos").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("ad-request-videos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!adType || !storeName || !location) {
      toast({ title: "تنبيه", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    if (!selectedPlan) {
      toast({ title: "تنبيه", description: "يرجى اختيار باقة أسعار متاحة", variant: "destructive" });
      return;
    }
    if (wantsEmail && !email) {
      toast({ title: "تنبيه", description: "يرجى إدخال البريد الإلكتروني", variant: "destructive" });
      return;
    }
    if (!mainMedia) {
      toast({ title: "تنبيه", description: "يرجى اختيار الصورة أو الفيديو الأساسي", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create the ad request
      const { data: request, error: reqError } = await supabase
        .from("ad_requests")
        .insert({
          ad_type: adType,
          ad_tier: adTier,
          store_name: storeName,
          city: location,
          total_price: totalPrice ?? 0,
          email: wantsEmail ? email : null,
        })
        .select("id, order_number")
        .single();

      if (reqError || !request) throw reqError || new Error("فشل إنشاء الطلب");

      // 2. Upload main media
      let mainUrl: string;
      let mainMediaType: string;
      if (mainMedia.type === 'video') {
        mainUrl = await uploadVideo(mainMedia.file, request.id, 0);
        mainMediaType = 'video';
      } else {
        mainUrl = await uploadImage(mainMedia.file, request.id, 0);
        mainMediaType = 'image';
      }
      await supabase.from("ad_request_images").insert({
        request_id: request.id,
        image_url: mainUrl,
        is_main: true,
        sort_order: 0,
        media_type: mainMediaType,
      });

      // 3. Upload extra images
      for (let i = 0; i < extraImages.length; i++) {
        const url = await uploadImage(extraImages[i].file, request.id, i + 1);
        await supabase.from("ad_request_images").insert({
          request_id: request.id,
          image_url: url,
          is_main: false,
          sort_order: i + 1,
          media_type: 'image',
        });
      }

      // 4. Upload extra video if exists
      if (extraVideo) {
        const videoUrl = await uploadVideo(extraVideo.file, request.id, extraImages.length + 1);
        await supabase.from("ad_request_images").insert({
          request_id: request.id,
          image_url: videoUrl,
          is_main: false,
          sort_order: extraImages.length + 1,
          media_type: 'video',
        });
      }

      setOrderNumber(request.order_number);

      // 3. Build WhatsApp URL for later use
      const message = `طلب إعلان جديد #${request.order_number}\nنوع الإعلان: ${adType}\nالفئة: ${adTier}\nاسم المتجر: ${storeName}\nالمدينة: ${location}\nالسعر: ${totalPrice} ريال`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      setWhatsappLink(whatsappUrl);

      // 4. Send email notifications
      try {
        await supabase.functions.invoke("send-ad-notification", {
          body: {
            orderNumber: request.order_number,
            adType,
            adTier,
            storeName,
            city: location,
            totalPrice,
            customerEmail: wantsEmail ? email : null,
          },
        });
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
      }

    } catch (err: any) {
      console.error(err);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (orderNumber) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
          <div className="px-5 py-3.5 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="touch-target">
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">تم إرسال الطلب</h1>
          </div>
        </div>
        <div className="px-5 pt-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">تم استلام طلبك بنجاح!</h2>
          <div className="bg-card border border-border rounded-2xl p-5 w-full">
            <p className="text-[13px] text-muted-foreground mb-1">رقم الطلب</p>
            <p className="text-3xl font-black text-primary">#{orderNumber}</p>
          </div>
          <p className="text-[13px] text-muted-foreground">احتفظ برقم الطلب للمتابعة. سيتم التواصل معك لتأكيد الطلب.</p>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform mt-4"
            >
              <Send className="w-5 h-5" />
              أرسل الطلب عبر الواتساب
            </a>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform mt-2"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">إضافة إعلان</h1>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Pricing display */}
        <div>
          <h2 className="text-[15px] font-bold text-foreground mb-3">أسعار الإعلانات</h2>
          {pricingLoading ? (
            <div className="bg-card border border-border rounded-2xl p-6 flex justify-center">
              <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : pricingPlans.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-4 text-center text-[13px] text-muted-foreground">
              لا توجد باقات أسعار حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {pricingPlans.map((plan, index) => {
                const Icon = getPlanIcon(plan.name);
                const style = cardStyles[index % cardStyles.length];
                return (
                  <div key={plan.id} className={`relative p-4 rounded-2xl bg-gradient-to-l ${style.color} border ${style.border}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-foreground">{plan.name}</p>
                        {plan.description && <p className="text-[11px] text-muted-foreground mt-1">{plan.description}</p>}
                      </div>
                      <div className="text-left">
                        <span className="text-xl font-black text-primary">{plan.price}</span>
                        <span className="text-[12px] text-muted-foreground mr-1">ريال / {plan.duration_days} يوم</span>
                      </div>
                    </div>
                    {featuredEnabled && (
                      <div className="flex items-center gap-1.5 mt-2.5 mr-16">
                        <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                        <span className="text-[11px] font-semibold text-muted-foreground">الإعلان المتميز: +{featuredExtra} ريال</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[15px] font-bold text-foreground">طلب إعلان</h2>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">نوع الإعلان</label>
            <select value={adType} onChange={(e) => setAdType(e.target.value)} className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">اختر نوع الإعلان</option>
              {adTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {featuredEnabled && (
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-2">فئة الإعلان</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAdTier("عادي")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${adTier === "عادي" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <Star className={`w-5 h-5 ${adTier === "عادي" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[14px] font-bold ${adTier === "عادي" ? "text-primary" : "text-foreground"}`}>عادي</span>
                </button>
                <button type="button" onClick={() => setAdTier("متميز")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${adTier === "متميز" ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/10" : "border-border bg-card"}`}>
                  <Sparkles className={`w-5 h-5 ${adTier === "متميز" ? "text-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
                  <span className={`text-[14px] font-bold ${adTier === "متميز" ? "text-[hsl(var(--gold))]" : "text-foreground"}`}>متميز</span>
                </button>
              </div>
              {adTier === "متميز" && (
                <p className="text-[11px] text-[hsl(var(--gold))] font-semibold mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> الإعلان المتميز يظهر في أعلى التطبيق بالصورة الكبيرة
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم المتجر / النشاط</label>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="مثال: كافيه الديوان" className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">المدينة</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">اختر المدينة</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Main media */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">
              الوسائط الأساسية <span className="text-[11px] text-muted-foreground font-normal">(صورة أو فيديو يظهر كغلاف)</span>
            </label>
            <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            <input ref={mainVideoInputRef} type="file" accept="video/*" className="hidden" onChange={handleMainVideo} />
            {mainMedia ? (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary">
                {mainMedia.type === 'video' ? (
                  <video src={mainMedia.preview} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mainMedia.preview} alt="الغلاف" className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => { URL.revokeObjectURL(mainMedia.preview); setMainMedia(null); }} className="absolute top-2 left-2 w-7 h-7 bg-foreground/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform">
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg">
                  {mainMedia.type === 'video' ? 'فيديو الغلاف' : 'صورة الغلاف'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => mainInputRef.current?.click()} className="aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 active:bg-primary/10 transition-colors">
                  <Camera className="w-7 h-7 text-primary/60" />
                  <span className="text-[12px] font-bold text-primary/70">صورة غلاف</span>
                </button>
                <button type="button" onClick={() => mainVideoInputRef.current?.click()} className="aspect-[4/3] rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 flex flex-col items-center justify-center gap-2 active:bg-accent/10 transition-colors">
                  <Video className="w-7 h-7 text-accent/60" />
                  <span className="text-[12px] font-bold text-accent/70">فيديو غلاف</span>
                </button>
              </div>
            )}
          </div>

          {/* Extra images */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">
              صور إضافية <span className="text-[11px] text-muted-foreground font-normal">(تظهر داخل تفاصيل الإعلان)</span>
            </label>
            <input ref={extraInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
            <div className="grid grid-cols-3 gap-2">
              {extraImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={img.preview} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExtraImage(i)} className="absolute top-1 left-1 w-6 h-6 bg-foreground/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform">
                    <X className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
              ))}
              {extraImages.length < 10 && (
                <button type="button" onClick={() => extraInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 active:bg-secondary/50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">إضافة صور</span>
                </button>
              )}
            </div>
            {extraImages.length > 0 && <p className="text-[11px] text-muted-foreground mt-1.5">{extraImages.length} / 10 صور</p>}
          </div>

          {/* Extra video */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">
              فيديو إضافي <span className="text-[11px] text-muted-foreground font-normal">(اختياري - يظهر داخل تفاصيل الإعلان)</span>
            </label>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleExtraVideo} />
            {extraVideo ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border">
                <video src={extraVideo.preview} className="w-full h-full object-cover" controls />
                <button type="button" onClick={() => { URL.revokeObjectURL(extraVideo.preview); setExtraVideo(null); }} className="absolute top-2 left-2 w-7 h-7 bg-foreground/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform">
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full py-4 rounded-2xl border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center gap-2 active:bg-secondary/50 transition-colors">
                <Video className="w-5 h-5 text-muted-foreground" />
                <span className="text-[12px] font-bold text-muted-foreground">إضافة فيديو</span>
                <span className="text-[10px] text-muted-foreground">(حتى 50 ميقا)</span>
              </button>
            )}
          </div>

          {/* Email notification */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <button
              type="button"
              onClick={() => setWantsEmail(!wantsEmail)}
              className="flex items-center gap-3 w-full"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${wantsEmail ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                {wantsEmail && <span className="text-primary-foreground text-[11px] font-bold">✓</span>}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Mail className={`w-4 h-4 ${wantsEmail ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[13px] font-bold ${wantsEmail ? "text-foreground" : "text-muted-foreground"}`}>
                  أريد إشعاري عبر الإيميل عند قبول إعلاني
                </span>
              </div>
            </button>
            {wantsEmail && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring text-left"
              />
            )}
          </div>

          {totalPrice !== null && selectedPlan && (
            <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <h3 className="text-[13px] font-bold text-foreground">ملخص السعر</h3>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">سعر الباقة</span>
                <span className="font-bold text-foreground">{selectedPlan.price} ريال</span>
              </div>
              {adTier === "متميز" && featuredEnabled && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[hsl(var(--gold))]" /> إعلان متميز
                  </span>
                  <span className="font-bold text-[hsl(var(--gold))]">+{featuredExtra} ريال</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-[14px]">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="font-black text-primary text-lg">{totalPrice} ريال</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated mt-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> أرسل طلب الإعلان
              </>
            )}
          </button>
          <p className="text-center text-muted-foreground text-[11px] pb-4">سيتم التواصل معك لتأكيد الطلب</p>
        </div>
      </div>
    </div>
  );
};

export default AddAdPage;
