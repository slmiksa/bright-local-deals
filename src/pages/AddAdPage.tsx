import { useState, useMemo, useRef } from "react";
import { Send, Store, PartyPopper, ChefHat, ArrowRight, Sparkles, Star, ImagePlus, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useCities } from "@/hooks/useAds";

const pricingPlans = [
  {
    icon: Store,
    title: "المتاجر",
    price: 300,
    period: "أسبوع",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    icon: PartyPopper,
    title: "أفراح ومناسبات",
    price: 250,
    period: "أسبوع",
    color: "from-accent/20 to-accent/5",
    border: "border-accent/30",
  },
  {
    icon: ChefHat,
    title: "أسر منتجة",
    price: 100,
    period: "أسبوع",
    color: "from-secondary/40 to-secondary/10",
    border: "border-border",
  },
];

const FEATURED_EXTRA = 50;
const adTypes = ["متجر", "أفراح ومناسبات", "أسر منتجة"];

const AddAdPage = () => {
  const navigate = useNavigate();
  const { data: cities = [] } = useCities();
  const [adType, setAdType] = useState("");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [adTier, setAdTier] = useState<"عادي" | "متميز">("عادي");

  const [mainImage, setMainImage] = useState<{ file: File; preview: string } | null>(null);
  const [extraImages, setExtraImages] = useState<{ file: File; preview: string }[]>([]);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const totalPrice = useMemo(() => {
    const plan = pricingPlans.find((p) => p.title === adType || (adType === "متجر" && p.title === "المتاجر"));
    if (!plan) return null;
    const base = plan.price;
    return adTier === "متميز" ? base + FEATURED_EXTRA : base;
  }, [adType, adTier]);

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainImage) URL.revokeObjectURL(mainImage.preview);
    setMainImage({ file, preview: URL.createObjectURL(file) });
  };

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 10 - extraImages.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setExtraImages((prev) => [...prev, ...newImages]);
  };

  const removeExtraImage = (index: number) => {
    setExtraImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (!adType || !storeName || !location) {
      toast({ title: "تنبيه", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    if (!mainImage) {
      toast({ title: "تنبيه", description: "يرجى اختيار الصورة الأساسية", variant: "destructive" });
      return;
    }
    const imagesCount = 1 + extraImages.length;
    const message = `طلب إعلان جديد:\nنوع الإعلان: ${adType}\nالفئة: ${adTier}\nاسم المتجر: ${storeName}\nالعنوان: ${location}\nالسعر: ${totalPrice} ريال\nعدد الصور: ${imagesCount} (الصورة الأساسية + ${extraImages.length} صور إضافية)\n\nيرجى إرسال الصور بعد هذه الرسالة`;
    const whatsappUrl = `https://wa.me/966500000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">إضافة إعلان</h1>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Pricing Cards */}
        <div>
          <h2 className="text-[15px] font-bold text-foreground mb-3">أسعار الإعلانات</h2>
          <div className="space-y-3">
            {pricingPlans.map((plan) => (
              <div key={plan.title} className={`relative p-4 rounded-2xl bg-gradient-to-l ${plan.color} border ${plan.border}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-foreground">{plan.title}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black text-primary">{plan.price}</span>
                    <span className="text-[12px] text-muted-foreground mr-1">ريال / {plan.period}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 mr-16">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                  <span className="text-[11px] font-semibold text-muted-foreground">الإعلان المتميز: +{FEATURED_EXTRA} ريال</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[15px] font-bold text-foreground">طلب إعلان</h2>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">نوع الإعلان</label>
            <select value={adType} onChange={(e) => setAdType(e.target.value)} className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">اختر نوع الإعلان</option>
              {adTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

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

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم المتجر / النشاط</label>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="مثال: كافيه الديوان" className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">المدينة</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">اختر المدينة</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">
              الصورة الأساسية <span className="text-[11px] text-muted-foreground font-normal">(تظهر كغلاف للإعلان)</span>
            </label>
            <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            {mainImage ? (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary">
                <img src={mainImage.preview} alt="الصورة الأساسية" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { URL.revokeObjectURL(mainImage.preview); setMainImage(null); }}
                  className="absolute top-2 left-2 w-7 h-7 bg-foreground/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg">
                  صورة الغلاف
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mainInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 active:bg-primary/10 transition-colors"
              >
                <Camera className="w-8 h-8 text-primary/60" />
                <span className="text-[13px] font-bold text-primary/70">اختر صورة الغلاف</span>
                <span className="text-[11px] text-muted-foreground">تظهر في بطاقة الإعلان</span>
              </button>
            )}
          </div>

          {/* Extra Images Upload */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">
              صور إضافية <span className="text-[11px] text-muted-foreground font-normal">(تظهر داخل تفاصيل الإعلان)</span>
            </label>
            <input ref={extraInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
            <div className="grid grid-cols-3 gap-2">
              {extraImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={img.preview} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(i)}
                    className="absolute top-1 left-1 w-6 h-6 bg-foreground/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
              ))}
              {extraImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => extraInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 active:bg-secondary/50 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">إضافة</span>
                </button>
              )}
            </div>
            {extraImages.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1.5">{extraImages.length} / 10 صور</p>
            )}
          </div>

          {totalPrice !== null && (
            <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <h3 className="text-[13px] font-bold text-foreground">ملخص السعر</h3>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">سعر الباقة</span>
                <span className="font-bold text-foreground">{pricingPlans.find((p) => p.title === adType || (adType === "متجر" && p.title === "المتاجر"))?.price} ريال</span>
              </div>
              {adTier === "متميز" && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="w-3 h-3 text-[hsl(var(--gold))]" /> إعلان متميز</span>
                  <span className="font-bold text-[hsl(var(--gold))]">+{FEATURED_EXTRA} ريال</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-[14px]">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="font-black text-primary text-lg">{totalPrice} ريال</span>
              </div>
            </div>
          )}

          <button onClick={handleSubmit} className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated mt-2">
            <Send className="w-5 h-5" /> أرسل طلب الإعلان
          </button>
          <p className="text-center text-muted-foreground text-[11px] pb-4">سيتم التواصل معك لتأكيد الطلب</p>
        </div>
      </div>
    </div>
  );
};

export default AddAdPage;
