import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Save, History } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface NotificationSetting {
  id?: string;
  category_id: string;
  enabled: boolean;
  target_mode: string;
  hours_before: number;
  notification_title: string;
  message_template: string;
  notification_subtitle: string;
}

interface SentNotification {
  id: string;
  ad_id: number;
  notification_type: string;
  sent_at: string;
  tokens_count: number;
}

const AdminNotifications = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Record<string, NotificationSetting>>({});
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokensCount, setTokensCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [catRes, settingsRes, sentRes, tokensRes] = await Promise.all([
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("notification_settings").select("*"),
      supabase.from("sent_notifications").select("*").order("sent_at", { ascending: false }).limit(50),
      supabase.from("device_tokens").select("id", { count: "exact", head: true }),
    ]);

    if (catRes.data) setCategories(catRes.data);

    const settingsMap: Record<string, NotificationSetting> = {};
    if (settingsRes.data) {
      for (const s of settingsRes.data) {
        settingsMap[s.category_id] = s as NotificationSetting;
      }
    }
    // Fill defaults for categories without settings
    if (catRes.data) {
      for (const cat of catRes.data) {
        if (!settingsMap[cat.id]) {
          settingsMap[cat.id] = {
            category_id: cat.id,
            enabled: false,
            target_mode: "city",
            hours_before: 24,
            notification_title: "لمحة",
            message_template: "🔔 آخر فرصة! {offer} ينتهي قريباً",
            notification_subtitle: "",
          };
        }
      }
    }
    setSettings(settingsMap);

    if (sentRes.data) setSentNotifications(sentRes.data as SentNotification[]);
    setTokensCount(tokensRes.count || 0);
    setLoading(false);
  };

  const updateSetting = (categoryId: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  };

  const saveSetting = async (categoryId: string) => {
    setSaving(true);
    const setting = settings[categoryId];

    const { error } = await supabase.from("notification_settings").upsert(
      {
        category_id: categoryId,
        enabled: setting.enabled,
        target_mode: setting.target_mode,
        hours_before: setting.hours_before,
        notification_title: setting.notification_title,
        message_template: setting.message_template,
        notification_subtitle: setting.notification_subtitle,
      },
      { onConflict: "category_id" }
    );

    if (error) {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات الإشعارات بنجاح" });
    }
    setSaving(false);
  };

  const saveAll = async () => {
    setSaving(true);
    const rows = Object.values(settings).map((s) => ({
      category_id: s.category_id,
      enabled: s.enabled,
      target_mode: s.target_mode,
      hours_before: s.hours_before,
      notification_title: s.notification_title,
      message_template: s.message_template,
      notification_subtitle: s.notification_subtitle,
    }));

    const { error } = await supabase.from("notification_settings").upsert(rows, { onConflict: "category_id" });

    if (error) {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم حفظ جميع الإعدادات بنجاح" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            إدارة الإشعارات التلقائية
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            أجهزة مسجّلة: <span className="font-bold text-foreground">{tokensCount}</span>
          </p>
        </div>
        <Button onClick={saveAll} disabled={saving}>
          <Save className="w-4 h-4 ml-2" />
          {saving ? "جاري الحفظ..." : "حفظ الكل"}
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((cat) => {
          const s = settings[cat.id];
          if (!s) return null;
          return (
            <Card key={cat.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${cat.id}`} className="text-xs text-muted-foreground">
                      {s.enabled ? "مفعّل" : "معطّل"}
                    </Label>
                    <Switch
                      id={`enabled-${cat.id}`}
                      checked={s.enabled}
                      onCheckedChange={(v) => updateSetting(cat.id, "enabled", v)}
                    />
                  </div>
                </div>
              </CardHeader>
              {s.enabled && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاستهداف</Label>
                      <Select
                        value={s.target_mode}
                        onValueChange={(v) => updateSetting(cat.id, "target_mode", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city">حسب مدينة الإعلان</SelectItem>
                          <SelectItem value="all">جميع المستخدمين</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>قبل الانتهاء بـ (ساعة)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={168}
                        value={s.hours_before}
                        onChange={(e) => updateSetting(cat.id, "hours_before", parseInt(e.target.value) || 24)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان الإشعار</Label>
                    <Input
                      value={s.notification_title}
                      onChange={(e) => updateSetting(cat.id, "notification_title", e.target.value)}
                      placeholder="لمحة"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نص الإشعار (الرئيسي)</Label>
                    <Textarea
                      value={s.message_template}
                      onChange={(e) => updateSetting(cat.id, "message_template", e.target.value)}
                      placeholder="🔔 آخر فرصة! عرض {shop_name} ينتهي قريباً"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>النص الفرعي (أسفل الإشعار)</Label>
                    <Input
                      value={s.notification_subtitle}
                      onChange={(e) => updateSetting(cat.id, "notification_subtitle", e.target.value)}
                      placeholder="لا تفوّت الفرصة!"
                      className="text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    المتغيرات المتاحة: {"{shop_name}"} - {"{offer}"} - {"{city}"}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => saveSetting(cat.id)} disabled={saving}>
                    <Save className="w-3 h-3 ml-1" />
                    حفظ هذا التصنيف
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sent notifications log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            سجل الإشعارات المرسلة (آخر 50)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات مرسلة بعد</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sentNotifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                  <div>
                    <span className="font-medium">إعلان #{n.ad_id}</span>
                    <span className="text-muted-foreground mx-2">—</span>
                    <span className="text-muted-foreground">{n.notification_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span>{n.tokens_count} جهاز</span>
                    <span>{new Date(n.sent_at).toLocaleString("ar-SA")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
