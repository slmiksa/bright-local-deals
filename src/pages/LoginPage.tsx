import { useState } from "react";
import { ArrowRight, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "مرحباً!", description: "تم تسجيل الدخول بنجاح" });
        navigate("/");
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: "تنبيه", description: "يرجى إدخال الاسم", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم التسجيل", description: "تفقد بريدك لتأكيد الحساب" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-10 pb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isLogin ? <LogIn className="w-8 h-8 text-primary" /> : <UserPlus className="w-8 h-8 text-primary" />}
          </div>
          <h2 className="text-xl font-extrabold text-foreground">
            {isLogin ? "أهلاً بعودتك" : "انضم إلينا"}
          </h2>
          <p className="text-muted-foreground text-[13px] mt-1">
            {isLogin ? "سجّل دخولك للمتابعة" : "أنشئ حسابك في لمحة"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">الاسم الكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card rounded-xl px-4 py-3 pl-12 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated mt-6 disabled:opacity-50"
          >
            {loading ? "جاري..." : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-primary text-[13px] font-semibold mt-4 py-2"
        >
          {isLogin ? "ليس لديك حساب؟ أنشئ حساب جديد" : "لديك حساب؟ سجّل دخولك"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
