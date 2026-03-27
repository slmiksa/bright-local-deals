

## خطة: نظام التحديث الإجباري للتطبيق

### التعديلات

#### 1. إضافة أعمدة للتحديث الإجباري في جدول `app_settings`
```sql
ALTER TABLE app_settings 
ADD COLUMN min_required_version text DEFAULT '1.1.0',
ADD COLUMN update_message text DEFAULT 'يوجد تحديث جديد، يرجى التحديث للاستمرار',
ADD COLUMN force_update boolean DEFAULT false;
```

#### 2. إنشاء `src/lib/version.ts`
ثابت يحدد الإصدار الحالي: `APP_VERSION = "1.1.0"`

#### 3. إنشاء `src/components/ForceUpdateModal.tsx`
- شاشة كاملة غير قابلة للإغلاق تظهر فقط داخل تطبيق Capacitor
- تعرض رسالة التحديث وزر "تحديث الآن" يفتح رابط App Store
- رابط: `https://apps.apple.com/sa/app/lamha-ads/id6760237672?l=ar`

#### 4. تعديل `src/App.tsx`
- جلب `min_required_version` و `force_update` من `app_settings`
- مقارنة مع `APP_VERSION` — إذا أقل وforce_update مفعّل، تظهر الشاشة الإجبارية

#### 5. إنشاء صفحة إدارة `src/pages/admin/AdminAppVersion.tsx`
- حقول: رقم الإصدار المطلوب، رسالة التحديث، تفعيل/إيقاف
- حفظ في `app_settings`

#### 6. تعديل `src/pages/admin/AdminLayout.tsx`
- إضافة رابط "تحديث التطبيق" في القائمة الجانبية

#### 7. تعديل `src/App.tsx` (Routes)
- إضافة route: `/admin/app-version`

### الملفات المتأثرة
- Migration جديد (أعمدة في `app_settings`)
- `src/lib/version.ts` (جديد)
- `src/components/ForceUpdateModal.tsx` (جديد)
- `src/pages/admin/AdminAppVersion.tsx` (جديد)
- `src/App.tsx` (تعديل)
- `src/pages/admin/AdminLayout.tsx` (تعديل)

