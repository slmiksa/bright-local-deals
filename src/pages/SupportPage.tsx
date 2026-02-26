import { Headphones, MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const contactOptions = [
  {
    icon: MessageCircle,
    title: "واتساب",
    desc: "تواصل معنا عبر الواتساب",
    action: () => window.open("https://wa.me/966500000000", "_blank"),
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Phone,
    title: "اتصال مباشر",
    desc: "اتصل بنا مباشرة",
    action: () => window.open("tel:+966500000000"),
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    desc: "أرسل لنا بريد إلكتروني",
    action: () => window.open("mailto:support@example.com"),
    color: "bg-orange-500/10 text-orange-600",
  },
];

const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">الدعم الفني</h1>
        </div>
      </div>

      <div className="px-5 pt-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-foreground">كيف نقدر نساعدك؟</h2>
          <p className="text-[13px] text-muted-foreground">تواصل معنا بأي طريقة تناسبك وسنرد عليك بأسرع وقت</p>
        </div>

        <div className="space-y-3">
          {contactOptions.map((opt) => (
            <button
              key={opt.title}
              onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opt.color}`}>
                <opt.icon className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <p className="text-[14px] font-bold text-foreground">{opt.title}</p>
                <p className="text-[12px] text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-[11px] pt-4">
          أوقات العمل: من السبت إلى الخميس ٩ ص - ٩ م
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
