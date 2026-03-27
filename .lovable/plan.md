

## خطة: تصغير التصنيفات وتمييز كل تصنيف بأيقونة فريدة

### المشكلة
- التصنيفات كبيرة الحجم حالياً
- جميع التصنيفات التي ليس لها أيقونة محددة تظهر بأيقونة `Smartphone` الافتراضية

### التعديلات

#### 1. توسيع قائمة الأيقونات (`CategoriesRow.tsx` و `CategoriesPage.tsx`)
إنشاء ملف مشترك `src/lib/categoryIcons.ts` يحتوي على أيقونات مميزة لكل تصنيف:

| التصنيف | الأيقونة |
|---------|----------|
| electronics | `Smartphone` |
| cafes | `CupSoda` |
| perfumes | `SprayCan` / `Glasses` |
| furniture | `Lamp` |
| food / مطاعم | `ChefHat` |
| events / دعوات زواج | `PartyPopper` |
| عقارات | `Building2` |
| أزياء واكسسوارات | `Shirt` |
| أسر منتجة | `Home` |
| الورود وزينة الأفراح | `Flower2` |
| احياء الحفلات | `Music` |
| + fallback | `Tag` (بدلاً من Smartphone) |

#### 2. تصغير حجم البطاقات (`CategoriesRow.tsx`)
- تصغير الأيقونة من `w-11 h-11` إلى `w-9 h-9`
- تصغير الـ padding من `py-3` إلى `py-2`
- تصغير النص من `text-[12px]` إلى `text-[11px]`
- تقليل الـ gap بين العناصر

#### 3. تصغير في صفحة التصنيفات (`CategoriesPage.tsx`)
- تصغير الأيقونة من `w-12 h-12` إلى `w-10 h-10`
- استخدام نفس ملف الأيقونات المشترك

#### 4. مطابقة الأيقونات بحقل `icon` من قاعدة البيانات
استخدام حقل `icon` المخزن في جدول `categories` لمطابقة الأيقونة ديناميكياً، مع fallback للقائمة الثابتة ثم أيقونة `Tag` الافتراضية.

### الملفات المتأثرة
- `src/lib/categoryIcons.ts` (جديد)
- `src/components/CategoriesRow.tsx`
- `src/pages/CategoriesPage.tsx`

