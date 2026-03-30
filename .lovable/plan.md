

## خطة إضافة Google Analytics

### ما سنفعله
إضافة Google Analytics (gtag.js) مرة واحدة في `index.html` + تتبع تلقائي لكل تنقل بين الصفحات.

### الخطوات

**1. إضافة سكربت gtag في `index.html`**
- إضافة سكربت Google Analytics في `<head>` مع الـ Measurement ID الخاص بك

**2. تتبع تنقل الصفحات تلقائياً**
- إنشاء مكون `GoogleAnalytics.tsx` يستخدم `useLocation` من React Router
- عند كل تغيير في المسار، يرسل `page_view` event تلقائياً
- إضافة المكون في `App.tsx` داخل `BrowserRouter`

### ما تحتاج تعطيني
- **Measurement ID** (يبدأ بـ `G-XXXXXXXXXX`)

### التأثير على الأداء
- **صفر تأثير** تقريباً — السكربت يتحمّل async ولا يعطّل الصفحة
- حجم السكربت ~28KB فقط
- يعمل بشكل عادي على الويب والتطبيق

