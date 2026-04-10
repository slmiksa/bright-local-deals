

# خطة إنشاء مستند بيانات المشروع لمبرمج Flutter

سأنشئ ملف PDF يحتوي على جميع بيانات الاتصال وهيكل قاعدة البيانات الكاملة لتسليمها لمبرمج Flutter.

## محتويات المستند

### 1. بيانات الاتصال
- Supabase URL
- Supabase Anon Key
- Project Ref

### 2. هيكل قاعدة البيانات (19 جدول)
كل جدول مع أعمدته وأنواعها والعلاقات:
- `ads`, `ad_images`, `ad_pricing`, `ad_requests`, `ad_request_images`
- `ad_stats`, `categories`, `cities`, `regions`
- `banner_slides`, `popup_ads`
- `giveaways`, `giveaway_entries`
- `device_tokens`, `notification_settings`, `sent_notifications`, `manual_notifications`
- `support_contacts`, `success_partners`, `terms_policies`, `app_settings`
- `user_roles`

### 3. Storage Buckets
- قائمة الـ buckets المتاحة وروابطها

### 4. ملاحظات للمبرمج
- طريقة التهيئة في Flutter باستخدام `supabase_flutter`
- منطق فلترة المدن (all, region:, comma-separated)
- سياسات RLS

## التنفيذ
- إنشاء ملف PDF منظم بالعربية والإنجليزية
- حفظه في `/mnt/documents/` للتحميل

