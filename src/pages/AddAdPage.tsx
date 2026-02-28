import { useState, useMemo } from "react";
import { Send, Store, PartyPopper, ChefHat, ArrowRight, Sparkles, Star } from "lucide-react";
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

  const totalPrice = useMemo(() => {
    const plan = pricingPlans.find((p) => p.title === adType || (adType === "متجر" && p.title === "المتاجر"));
    if (!plan) return null;
    const base = plan.price;
    return adTier === "متميز" ? base + FEATURED_EXTRA : base;
  }, [adType, adTier]);

  const handleSubmit = () => {
    if (!adType || !storeName || !location) {
      toast({ title: "تنبيه", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    const message = `طلب إعلان جديد:\nنوع الإعلان: ${adType}\nالفئة: ${adTier}\nاسم المتجر: ${storeName}\nالعنوان: ${location}\nالسعر: ${totalPrice} ريال`;
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
