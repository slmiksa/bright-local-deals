

# نظام السحوبات الترويجية

## الفكرة
نظام سحب يظهر/يختفي بتحكم الأدمن، مع عداد تنازلي، تسجيل مشاركين، إعلان فائز، وإمكانية إضافة راعي اختياري مع لوقو.

## قاعدة البيانات

### جدول `giveaways`
| عمود | نوع | وصف |
|-------|------|------|
| id | uuid PK | معرف |
| title | text | عنوان السحب |
| prize | text | الجائزة |
| end_date | timestamptz | موعد السحب |
| snapchat_url | text | رابط السناب |
| active | boolean default false | إظهار/إخفاء |
| winner_name | text nullable | اسم الفائز |
| sponsor_name | text nullable | اسم الراعي (اختياري) |
| sponsor_logo_url | text nullable | لوقو الراعي (اختياري) |
| created_at | timestamptz | تاريخ الإنشاء |

- RLS: قراءة عامة، تعديل للأدمن فقط

### جدول `giveaway_entries`
| عمود | نوع | وصف |
|-------|------|------|
| id | uuid PK | معرف |
| giveaway_id | uuid FK → giveaways | مرجع للسحب |
| name | text | اسم المشارك |
| phone | text | رقم الجوال |
| created_at | timestamptz | وقت التسجيل |

- قيد فريد على `(giveaway_id, phone)`
- RLS: قراءة وإدراج عامة، حذف للأدمن

## المكونات الجديدة

### `GiveawaySection.tsx` — الصفحة الرئيسية
ثلاث حالات:

1. **السحب جاري**: عنوان + جائزة + عداد تنازلي + نموذج (اسم/جوال) + زر اشتراك + زر سناب + إذا وُجد راعي يظهر "برعاية [اسم]" مع اللوقو
2. **تم إعلان الفائز**: تصميم احتفالي 🏆 مع اسم الفائز + زر سناب + الراعي إن وُجد
3. **لا يوجد سحب نشط**: لا يظهر شيء

### `AdminGiveaways.tsx` — لوحة التحكم
- إنشاء/تعديل سحب (عنوان، جائزة، تاريخ، رابط سناب)
- حقول اختيارية: اسم الراعي + رفع لوقو الراعي (إلى storage bucket)
- تفعيل/تعطيل السحب (switch)
- عرض قائمة المشتركين + عددهم
- حقل اسم الفائز + زر "إعلان الفائز"
- زر سحب عشوائي

## Storage
- إنشاء bucket جديد `giveaway-images` (public) لتخزين لوقو الرعاة

## التعديلات على الملفات الحالية
- **`Index.tsx`**: إضافة `<GiveawaySection />` بعد `<BannerSlider />`
- **`App.tsx`**: إضافة route `/admin/giveaways`
- **`AdminLayout.tsx`**: إضافة رابط "السحوبات" مع أيقونة `Gift`

## الملفات المتأثرة
- Migration SQL (جدولين + RLS)
- `src/components/GiveawaySection.tsx` — جديد
- `src/pages/admin/AdminGiveaways.tsx` — جديد
- `src/pages/Index.tsx`
- `src/App.tsx`
- `src/pages/admin/AdminLayout.tsx`

