

# إضافة زر مشاركة الفيديو في المعرض مع Deep Link

## الفكرة
- زر مشاركة في الشريط الجانبي للمعرض
- الرابط المُشارك: `https://lamha.trndsky.com/gallery/{adId}`
- عند فتح الرابط → يفتح المعرض ويبدأ بالفيديو المحدد أولاً

## التعديلات

### 1. `src/App.tsx`
- إضافة route جديد `/gallery/:adId` بجانب `/gallery` الحالي، كلاهما يفتح `GalleryPage`

### 2. `src/pages/GalleryPage.tsx`
- استيراد `useParams` لقراءة `adId` من الـ URL
- استيراد أيقونة `Share2` من lucide
- تعديل `shuffled` useMemo: إذا وُجد `adId` في الـ URL → وضع فيديوهات ذلك الإعلان في البداية ثم باقي الفيديوهات عشوائياً بعدها
- إضافة **زر مشاركة** في الشريط الجانبي (فوق زر الصوت) يستخدم:
  - `navigator.share()` على الأجهزة التي تدعمه (iOS/Android)
  - نسخ الرابط للحافظة كـ fallback
  - الرابط دائماً بصيغة `https://lamha.trndsky.com/gallery/{activeAdId}`
  - عرض toast "تم نسخ الرابط" عند النسخ

### الملفات المتأثرة
- `src/App.tsx` — إضافة route
- `src/pages/GalleryPage.tsx` — زر مشاركة + ترتيب الفيديو حسب الـ param

