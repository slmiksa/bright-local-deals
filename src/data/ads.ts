import adCafe from "@/assets/ad-cafe-1.jpg";
import adTech from "@/assets/ad-tech-1.jpg";
import adPerfume from "@/assets/ad-perfume-1.jpg";
import adFurniture from "@/assets/ad-furniture-1.jpg";
import adFood from "@/assets/ad-food-1.jpg";

export interface Ad {
  id: number;
  images: string[];
  shopName: string;
  offer: string;
  featured?: boolean;
  category: string;
  city: string;
  phone: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
}

export interface Section {
  id: string;
  title: string;
  ads: Ad[];
}

export const cities = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "أبها", "تبوك", "بريدة", "حائل",
];

export const allAds: Ad[] = [
  { id: 1, images: [adTech, adTech, adTech], shopName: "متجر التقنية", offer: "خصم 20% على جميع الأجهزة", featured: true, category: "electronics", city: "الرياض", phone: "0501234567", description: "أكبر متجر للإلكترونيات في الرياض. نوفر أحدث الأجهزة من آبل وسامسونج وهواوي مع ضمان رسمي.", lat: 24.7136, lng: 46.6753, address: "طريق الملك فهد، الرياض" },
  { id: 2, images: [adTech, adTech], shopName: "عالم الجوالات", offer: "أحدث موديلات سامسونج", category: "electronics", city: "الرياض", phone: "0507654321", description: "متخصصون في الجوالات الذكية وملحقاتها.", lat: 24.7236, lng: 46.6853, address: "حي العليا، الرياض" },
  { id: 3, images: [adTech, adTech], shopName: "حلول الكمبيوتر", offer: "صيانة مجانية عند الشراء", category: "electronics", city: "الرياض", phone: "0509876543", description: "صيانة وبيع أجهزة الكمبيوتر واللابتوب.", lat: 24.7336, lng: 46.6953, address: "حي الملز، الرياض" },
  { id: 4, images: [adTech, adTech, adTech], shopName: "ملحقات ذكية", offer: "إكسسوارات أصلية", featured: true, category: "electronics", city: "الرياض", phone: "0502345678", description: "إكسسوارات وملحقات أصلية لجميع الأجهزة.", lat: 24.7436, lng: 46.7053, address: "حي النخيل، الرياض" },
  { id: 41, images: [adTech, adTech], shopName: "تقني بلس", offer: "شاشات بأسعار خاصة", category: "electronics", city: "الرياض", phone: "0503456789", description: "شاشات تلفزيون وكمبيوتر بأفضل الأسعار.", lat: 24.7536, lng: 46.7153, address: "حي الياسمين، الرياض" },
  { id: 50, images: [adTech, adTech], shopName: "تكنو جدة", offer: "عروض نهاية الأسبوع", featured: true, category: "electronics", city: "جدة", phone: "0561234567", description: "أفضل عروض الإلكترونيات في جدة.", lat: 21.4858, lng: 39.1925, address: "طريق المدينة، جدة" },
  { id: 51, images: [adTech], shopName: "ديجيتال ستور", offer: "أجهزة قيمنق بأسعار منافسة", category: "electronics", city: "جدة", phone: "0562345678", description: "متجر متخصص في أجهزة الألعاب.", lat: 21.4958, lng: 39.2025, address: "حي الحمراء، جدة" },
  { id: 5, images: [adCafe, adCafe, adCafe], shopName: "كافيه الديوان", offer: "قهوة مختصة + حلى مجاناً", featured: true, category: "cafes", city: "الرياض", phone: "0504567890", description: "كافيه متخصص بالقهوة المختصة بأجواء تراثية سعودية أصيلة. جلسات داخلية وخارجية.", lat: 24.6936, lng: 46.6553, address: "حي السفارات، الرياض" },
  { id: 6, images: [adCafe, adCafe], shopName: "بن الشيوخ", offer: "أجواء تراثية مميزة", category: "cafes", city: "الرياض", phone: "0505678901", description: "قهوة عربية أصيلة بطريقة تقليدية.", lat: 24.7036, lng: 46.6653, address: "حي الملقا، الرياض" },
  { id: 7, images: [adCafe, adCafe], shopName: "قهوة المساء", offer: "جلسات خارجية هادئة", category: "cafes", city: "الرياض", phone: "0506789012", description: "أجواء هادئة مع إطلالة جميلة.", lat: 24.7536, lng: 46.6353, address: "حي الرائد، الرياض" },
  { id: 8, images: [adCafe, adCafe], shopName: "روقان كافيه", offer: "عرض الويكند ٢×١", category: "cafes", city: "الرياض", phone: "0507890123", description: "كافيه شبابي بأسعار مناسبة.", lat: 24.7636, lng: 46.6453, address: "حي الورود، الرياض" },
  { id: 81, images: [adCafe], shopName: "ذوق القهوة", offer: "V60 بسعر خاص", category: "cafes", city: "الرياض", phone: "0508901234", description: "متخصصون في القهوة المقطرة.", lat: 24.7136, lng: 46.6253, address: "حي الصحافة، الرياض" },
  { id: 52, images: [adCafe, adCafe, adCafe], shopName: "بحر كافيه", offer: "إطلالة على الكورنيش", featured: true, category: "cafes", city: "جدة", phone: "0563456789", description: "كافيه بإطلالة بحرية ساحرة.", lat: 21.5258, lng: 39.1725, address: "كورنيش جدة" },
  { id: 9, images: [adPerfume, adPerfume, adPerfume], shopName: "دار العود", offer: "عود فاخر بأسعار مميزة", featured: true, category: "perfumes", city: "الرياض", phone: "0509012345", description: "أجود أنواع العود والبخور الطبيعي من الهند وكمبوديا.", lat: 24.6836, lng: 46.6953, address: "طريق العروبة، الرياض" },
  { id: 10, images: [adPerfume, adPerfume], shopName: "عطور الخليج", offer: "بخور ودهن عود طبيعي", category: "perfumes", city: "الرياض", phone: "0500123456", description: "عطور شرقية وغربية فاخرة.", lat: 24.6936, lng: 46.7053, address: "حي الازدهار، الرياض" },
  { id: 11, images: [adPerfume, adPerfume], shopName: "روائح الشرق", offer: "تشكيلة فرنسية جديدة", category: "perfumes", city: "الرياض", phone: "0501234560", description: "وكيل معتمد لأشهر الماركات العالمية.", lat: 24.7036, lng: 46.7153, address: "غرناطة مول، الرياض" },
  { id: 12, images: [adPerfume, adPerfume, adPerfume], shopName: "مسك الختام", offer: "هدايا جاهزة للتغليف", featured: true, category: "perfumes", city: "الرياض", phone: "0502345670", description: "متخصصون في تجهيز هدايا العطور.", lat: 24.7136, lng: 46.7253, address: "بانوراما مول، الرياض" },
  { id: 13, images: [adFurniture, adFurniture, adFurniture], shopName: "أثاث المنزل", offer: "تخفيضات نهاية الموسم", featured: true, category: "furniture", city: "الرياض", phone: "0503456780", description: "أثاث منزلي عصري بجودة عالية.", lat: 24.7636, lng: 46.7353, address: "طريق خريص، الرياض" },
  { id: 14, images: [adFurniture, adFurniture], shopName: "ديكور حديث", offer: "تصاميم عصرية", category: "furniture", city: "الرياض", phone: "0504567891", description: "تصميم داخلي وديكور حديث.", lat: 24.7736, lng: 46.7453, address: "حي الربيع، الرياض" },
  { id: 15, images: [adFurniture, adFurniture], shopName: "سرير وأكثر", offer: "شحن مجاني للرياض", category: "furniture", city: "الرياض", phone: "0505678902", description: "أسرّة ومراتب بضمان 10 سنوات.", lat: 24.7836, lng: 46.7553, address: "حي الملقا، الرياض" },
  { id: 16, images: [adFurniture], shopName: "بيت الأناقة", offer: "ضمان سنتين", category: "furniture", city: "الرياض", phone: "0506789013", description: "أثاث تركي وإيطالي فاخر.", lat: 24.7936, lng: 46.7653, address: "حي الياسمين، الرياض" },
  { id: 17, images: [adFood, adFood, adFood], shopName: "مطبخ الوالدة", offer: "أكل بيتي يومي", featured: true, category: "food", city: "الرياض", phone: "0507890124", description: "أكلات بيتية يومية طازجة. كبسة، مندي، مطبق.", lat: 24.6536, lng: 46.6353, address: "حي الشفا، الرياض" },
  { id: 18, images: [adFood, adFood], shopName: "شاورما الشام", offer: "وجبة عائلية ٤٩ ريال", category: "food", city: "الرياض", phone: "0508901235", description: "شاورما عربية أصلية.", lat: 24.6636, lng: 46.6453, address: "حي البديعة، الرياض" },
  { id: 19, images: [adFood, adFood], shopName: "برجر فاكتوري", offer: "اطلب ٢ والثالث مجان", category: "food", city: "الرياض", phone: "0509012346", description: "برجر طازج بلحم أنقس.", lat: 24.6736, lng: 46.6553, address: "حي العقيق، الرياض" },
  { id: 20, images: [adFood, adFood], shopName: "حلويات الأمير", offer: "كنافة طازجة يومياً", category: "food", city: "الرياض", phone: "0500123457", description: "حلويات شرقية وغربية.", lat: 24.6836, lng: 46.6653, address: "حي الروضة، الرياض" },
  { id: 60, images: [adCafe, adCafe], shopName: "قاعة الماسة", offer: "خصم 15% على حجوزات الصيف", featured: false, category: "events", city: "الرياض", phone: "0511234567", description: "قاعة أفراح فاخرة تتسع لـ 500 شخص مع خدمة ضيافة متكاملة.", lat: 24.7236, lng: 46.7153, address: "طريق الملك عبدالله، الرياض" },
  { id: 61, images: [adPerfume, adPerfume], shopName: "تنظيم ليالي", offer: "باقات تنظيم حفلات", featured: false, category: "events", city: "الرياض", phone: "0512345678", description: "تنظيم حفلات زواج ومناسبات خاصة باحترافية عالية.", lat: 24.7336, lng: 46.7253, address: "حي الملقا، الرياض" },
  { id: 62, images: [adFood, adFood], shopName: "ضيافة الأصيل", offer: "بوفيهات مفتوحة من ٥٠ ريال", featured: false, category: "events", city: "الرياض", phone: "0513456789", description: "خدمة ضيافة وبوفيهات للمناسبات والأفراح.", lat: 24.7436, lng: 46.7353, address: "حي النرجس، الرياض" },
  { id: 63, images: [adFurniture, adFurniture], shopName: "زينة المناسبات", offer: "تجهيز كوشات وديكور", featured: false, category: "events", city: "الرياض", phone: "0514567890", description: "تصميم وتجهيز كوشات أفراح وديكورات مناسبات.", lat: 24.7536, lng: 46.7453, address: "حي الياسمين، الرياض" },
  { id: 64, images: [adCafe], shopName: "تصوير لحظات", offer: "باقة تصوير كاملة ٢٠٠٠ ريال", featured: false, category: "events", city: "الرياض", phone: "0515678901", description: "تصوير احترافي فوتو وفيديو للأفراح والمناسبات.", lat: 24.7636, lng: 46.7553, address: "حي العقيق، الرياض" },
];

export const categoryMap: Record<string, string> = {
  electronics: "💻 إلكترونيات",
  cafes: "☕ كافيهات",
  perfumes: "🌸 عطور وروائح",
  furniture: "🛋 مفروشات",
  food: "🍔 مأكولات",
  events: "💍 أفراح ومناسبات",
};

export function getAdsByCity(city: string): Section[] {
  const filtered = allAds.filter((ad) => ad.city === city);
  const grouped: Record<string, Ad[]> = {};
  for (const ad of filtered) {
    if (!grouped[ad.category]) grouped[ad.category] = [];
    grouped[ad.category].push(ad);
  }
  return Object.entries(grouped).map(([id, ads]) => ({
    id,
    title: categoryMap[id] || id,
    ads,
  }));
}

export function getAdById(id: number): Ad | undefined {
  return allAds.find((ad) => ad.id === id);
}

export function getFeaturedAds(city: string): Ad[] {
  return allAds.filter((ad) => ad.city === city && ad.featured);
}
