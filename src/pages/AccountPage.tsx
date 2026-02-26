import { User, Settings, FileText, Star, HelpCircle, LogOut, ChevronLeft } from "lucide-react";

const menuItems = [
  { icon: FileText, label: "إعلاناتي", desc: "إدارة إعلاناتك المنشورة" },
  { icon: Star, label: "المفضلة", desc: "الإعلانات المحفوظة" },
  { icon: Settings, label: "الإعدادات", desc: "إعدادات الحساب والإشعارات" },
  { icon: HelpCircle, label: "المساعدة", desc: "الأسئلة الشائعة والدعم" },
];

const AccountPage = () => {
  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5">
          <h1 className="text-lg font-bold text-foreground">حسابي</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 pt-5">
        <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[16px] text-foreground">مرحباً بك</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">سجل دخولك لإدارة إعلاناتك</p>
          </div>
        </div>

        {/* Login Button */}
        <button className="touch-target w-full mt-4 bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated">
          تسجيل الدخول
        </button>

        {/* Menu */}
        <div className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="touch-target w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[14px] font-bold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="touch-target w-full mt-6 flex items-center justify-center gap-2 text-destructive font-semibold text-[14px] py-3 active:opacity-70 transition-opacity">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
