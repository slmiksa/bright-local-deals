import { useState } from "react";
import { Send, Store, PartyPopper, ChefHat, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const pricingPlans = [
  {
    icon: Store,
    title: "المتاجر",
    price: "300",
    period: "أسبوع",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    icon: PartyPopper,
    title: "أفراح ومناسبات",
    price: "250",
    period: "أسبوع",
    color: "from-accent/20 to-accent/5",
    border: "border-accent/30",
  },
  {
    icon: ChefHat,
    title: "أسر منتجة",
    price: "100",
    period: "أسبوع",
    color: "from-secondary/40 to-secondary/10",
    border: "border-border",
  },
];

const adTypes = ["متجر", "أفراح ومناسبات", "أسر منتجة"];
const locations = ["القوز", "القنفذة", "حلي"];

const AddAdPage = () => {
  const navigate = useNavigate();
  const [adType, setAdType] = useState("");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!adType || !storeName || !location) {
      toast({
        title: "تنبيه",
        description: "يرجى تعبئة جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const message = `طلب إعلان جديد:\nنوع الإعلان: ${adType}\nاسم المتجر: ${storeName}\nالعنوان: ${location}`;
    const whatsappUrl = `https://wa.me/966500000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      {/* Header */}
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
              <div
                key={plan.title}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-l ${plan.color} border ${plan.border}`}
              >
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
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[15px] font-bold text-foreground">طلب إعلان</h2>

          {/* Ad Type */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">نوع الإعلان</label>
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value)}
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">اختر نوع الإعلان</option>
              {adTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم المتجر / النشاط</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="مثال: كافيه الديوان"
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">العنوان</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">اختر المدينة</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated mt-2"
          >
            <Send className="w-5 h-5" />
            أرسل طلب الإعلان
          </button>

          <p className="text-center text-muted-foreground text-[11px] pb-4">
            سيتم التواصل معك لتأكيد الطلب
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddAdPage;
