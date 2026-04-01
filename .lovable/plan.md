

## خطة تنفيذ نظام الإشعارات التلقائية مع تحكم يدوي

### الخطوة 1: حفظ Firebase Service Account كسر آمن
- حفظ محتوى ملف JSON كـ secret باسم `FIREBASE_SERVICE_ACCOUNT`

### الخطوة 2: إنشاء 3 جداول في قاعدة البيانات

**`device_tokens`** — توكنات أجهزة المستخدمين:
- `id` (uuid), `token` (text, unique), `platform` (text), `city` (text), `region_id` (uuid), `created_at`, `updated_at`
- RLS: INSERT/UPDATE عام (بدون تسجيل دخول)، SELECT للأدمن فقط

**`sent_notifications`** — منع تكرار الإشعارات:
- `id` (uuid), `ad_id` (integer), `notification_type` (text), `sent_at` (timestamp)
- قيد فريد على `(ad_id, notification_type)`

**`notification_settings`** — إعدادات لكل تصنيف:
- `id` (uuid), `category_id` (text), `enabled` (boolean), `target_mode` ("city" | "all"), `hours_before` (integer, default 24), `message_template` (text), `created_at`, `updated_at`

### الخطوة 3: تعديل الكود لحفظ التوكن مع المدينة

**`src/lib/capacitor.ts`:**
- عند نجاح تسجيل FCM → upsert التوكن + المدينة/المنطقة الحالية من localStorage

**`src/contexts/CityContext.tsx`:**
- عند تغيير المدينة (`selectCity` / `selectRegion`) → تحديث سجل التوكن في قاعدة البيانات

### الخطوة 4: صفحة إدارة الإشعارات في لوحة التحكم

**إنشاء `src/pages/admin/AdminNotifications.tsx`:**
- عرض كل التصنيفات مع مفتاح تفعيل/تعطيل
- لكل تصنيف: اختيار الاستهداف (كل المدن / حسب مدينة الإعلان)
- تعديل عدد الساعات ونص الإشعار
- سجل آخر الإشعارات المرسلة

**تعديل `AdminLayout.tsx` و `App.tsx`:**
- إضافة رابط "الإشعارات" + Route

### الخطوة 5: Edge Function — `send-auto-reminder`

**إنشاء `supabase/functions/send-auto-reminder/index.ts`:**
1. قراءة `FIREBASE_SERVICE_ACCOUNT` → توليد OAuth2 Access Token عبر JWT signing (Web Crypto API)
2. جلب التصنيفات المفعّلة من `notification_settings`
3. لكل تصنيف: البحث عن إعلانات `end_date` خلال `hours_before`
4. التحقق من `sent_notifications` لمنع التكرار
5. فلترة التوكنات:
   - `target_mode = "city"` → توكنات نفس مدينة/منطقة الإعلان
   - `target_mode = "all"` → جميع التوكنات
6. إرسال عبر FCM v1 API: `POST https://fcm.googleapis.com/v1/projects/lamha-ads/messages:send`
7. تسجيل في `sent_notifications`

### الخطوة 6: جدولة Cron Job
- تفعيل `pg_cron` و `pg_net`
- مهمة كل ساعة تستدعي الدالة تلقائياً

### الملفات المتأثرة
| ملف | عملية |
|------|--------|
| Migration SQL | إنشاء 3 جداول + RLS |
| `src/lib/capacitor.ts` | تعديل — حفظ التوكن مع المدينة |
| `src/contexts/CityContext.tsx` | تعديل — تحديث التوكن عند تغيير المدينة |
| `src/pages/admin/AdminNotifications.tsx` | إنشاء — صفحة إدارة الإشعارات |
| `src/pages/admin/AdminLayout.tsx` | تعديل — إضافة رابط الإشعارات |
| `src/App.tsx` | تعديل — إضافة Route |
| `supabase/functions/send-auto-reminder/index.ts` | إنشاء — دالة الإرسال التلقائي |
| Cron Job SQL | إنشاء — جدولة كل ساعة |

