import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff, Check, Phone } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("whatsapp_number").eq("id", "default").single().then(({ data }) => {
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
    });
  }, []);

  const handleSaveWhatsapp = async () => {
    if (!whatsappNumber.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم الواتساب", variant: "destructive" });
      return;
    }
    setWhatsappLoading(true);
    const { error } = await supabase.from("app_settings").update({ whatsapp_number: whatsappNumber.trim() }).eq("id", "default");
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم تحديث رقم الواتساب بنجاح" });
    }
    setWhatsappLoading(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال البريد الجديد", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("update-admin-email", {
      body: { newEmail: newEmail.trim() },
    });
    if (error || data?.error) {
      toast({ title: "خطأ", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم تغيير البريد الإلكتروني بنجاح" });
      setNewEmail("");
      // Refresh session to reflect new email
      await supabase.auth.refreshSession();
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({ title: "خطأ", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-black text-foreground mb-6">إعدادات الحساب</h1>

      <div className="space-y-6 max-w-lg">
        {/* WhatsApp Number */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" /> رقم الواتساب لاستقبال الطلبات
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="مثال: 966500000000"
              className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
            />
            <p className="text-[11px] text-muted-foreground">أدخل الرقم بصيغة دولية بدون + (مثال: 966500000000)</p>
            <button
              onClick={handleSaveWhatsapp}
              disabled={whatsappLoading}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> حفظ الرقم
            </button>
          </div>
        </div>

        {/* Current Info */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" /> البريد الحالي
          </h2>
          <p className="text-sm text-muted-foreground bg-background rounded-xl px-4 py-3 border border-border" dir="ltr">
            {user?.email}
          </p>
        </div>

        {/* Change Email */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" /> تغيير البريد الإلكتروني
          </h2>
          <div className="space-y-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="البريد الإلكتروني الجديد"
              className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
            />
            <button
              onClick={handleChangeEmail}
              disabled={loading}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> تحديث البريد
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> تغيير كلمة المرور
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full h-10 px-3 pl-10 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تأكيد كلمة المرور الجديدة"
              className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> تغيير كلمة المرور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
