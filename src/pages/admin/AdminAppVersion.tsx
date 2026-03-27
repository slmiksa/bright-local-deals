import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { APP_VERSION } from "@/lib/version";
import { Loader2, Save } from "lucide-react";

const AdminAppVersion = () => {
  const [minVersion, setMinVersion] = useState("1.1.0");
  const [updateMessage, setUpdateMessage] = useState("يوجد تحديث جديد، يرجى التحديث للاستمرار");
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("https://apps.apple.com/sa/app/lamha-ads/id6760237672?l=ar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("min_required_version, update_message, force_update, store_url")
        .eq("id", "default")
        .single();
      if (data) {
        setMinVersion(data.min_required_version || "1.1.0");
        setUpdateMessage(data.update_message || "");
        setForceUpdate(data.force_update || false);
        setStoreUrl((data as any).store_url || "https://apps.apple.com/sa/app/lamha-ads/id6760237672?l=ar");
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        min_required_version: minVersion,
        update_message: updateMessage,
        force_update: forceUpdate,
        store_url: storeUrl,
      } as any)
      .eq("id", "default");

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ بنجاح" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">تحديث التطبيق الإجباري</h1>
        <p className="text-sm text-muted-foreground mt-1">
          الإصدار الحالي في الكود: <span className="font-mono font-bold text-foreground">{APP_VERSION}</span>
        </p>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">تفعيل التحديث الإجباري</label>
          <Switch checked={forceUpdate} onCheckedChange={setForceUpdate} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">الحد الأدنى للإصدار المطلوب</label>
          <Input
            value={minVersion}
            onChange={(e) => setMinVersion(e.target.value)}
            placeholder="مثال: 1.2.0"
            dir="ltr"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            أي إصدار أقل من هذا سيُطلب منه التحديث
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">رسالة التحديث</label>
          <Textarea
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">رابط المتجر (App Store)</label>
          <Input
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://apps.apple.com/..."
            dir="ltr"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            الرابط الذي سينتقل إليه المستخدم عند الضغط على "تحديث الآن"
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </Button>
      </div>
    </div>
  );
};

export default AdminAppVersion;
