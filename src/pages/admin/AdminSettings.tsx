import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff, Check } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال البريد الجديد", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إرسال رابط التأكيد إلى البريد الجديد" });
      setNewEmail("");
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
