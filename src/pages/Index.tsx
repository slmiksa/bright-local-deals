import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import AdSection from "@/components/AdSection";
import BottomTabBar from "@/components/BottomTabBar";

import featuredCoffee from "@/assets/featured-coffee.jpg";
import featuredElectronics from "@/assets/featured-electronics.jpg";
import featuredPerfume from "@/assets/featured-perfume.jpg";
import adCafe from "@/assets/ad-cafe-1.jpg";
import adTech from "@/assets/ad-tech-1.jpg";
import adPerfume from "@/assets/ad-perfume-1.jpg";
import adFurniture from "@/assets/ad-furniture-1.jpg";
import adFood from "@/assets/ad-food-1.jpg";

const sections = [
  {
    id: "electronics",
    title: "💻 إلكترونيات",
    ads: [
      { id: 1, image: adTech, shopName: "متجر التقنية", offer: "خصم 20% على جميع الأجهزة", featured: true },
      { id: 2, image: adTech, shopName: "عالم الجوالات", offer: "أحدث موديلات سامسونج" },
      { id: 3, image: adTech, shopName: "حلول الكمبيوتر", offer: "صيانة مجانية عند الشراء" },
      { id: 4, image: adTech, shopName: "ملحقات ذكية", offer: "إكسسوارات أصلية", featured: true },
      { id: 41, image: adTech, shopName: "تقني بلس", offer: "شاشات بأسعار خاصة" },
    ],
  },
  {
    id: "cafes",
    title: "☕ كافيهات",
    ads: [
      { id: 5, image: adCafe, shopName: "كافيه الديوان", offer: "قهوة مختصة + حلى مجاناً", featured: true },
      { id: 6, image: adCafe, shopName: "بن الشيوخ", offer: "أجواء تراثية مميزة" },
      { id: 7, image: adCafe, shopName: "قهوة المساء", offer: "جلسات خارجية هادئة" },
      { id: 8, image: adCafe, shopName: "روقان كافيه", offer: "عرض الويكند ٢×١" },
      { id: 81, image: adCafe, shopName: "ذوق القهوة", offer: "V60 بسعر خاص" },
    ],
  },
  {
    id: "perfumes",
    title: "🌸 عطور وروائح",
    ads: [
      { id: 9, image: adPerfume, shopName: "دار العود", offer: "عود فاخر بأسعار مميزة", featured: true },
      { id: 10, image: adPerfume, shopName: "عطور الخليج", offer: "بخور ودهن عود طبيعي" },
      { id: 11, image: adPerfume, shopName: "روائح الشرق", offer: "تشكيلة فرنسية جديدة" },
      { id: 12, image: adPerfume, shopName: "مسك الختام", offer: "هدايا جاهزة للتغليف", featured: true },
    ],
  },
  {
    id: "furniture",
    title: "🛋 مفروشات",
    ads: [
      { id: 13, image: adFurniture, shopName: "أثاث المنزل", offer: "تخفيضات نهاية الموسم", featured: true },
      { id: 14, image: adFurniture, shopName: "ديكور حديث", offer: "تصاميم عصرية" },
      { id: 15, image: adFurniture, shopName: "سرير وأكثر", offer: "شحن مجاني للرياض" },
      { id: 16, image: adFurniture, shopName: "بيت الأناقة", offer: "ضمان سنتين" },
    ],
  },
  {
    id: "food",
    title: "🍔 مأكولات",
    ads: [
      { id: 17, image: adFood, shopName: "مطبخ الوالدة", offer: "أكل بيتي يومي", featured: true },
      { id: 18, image: adFood, shopName: "شاورما الشام", offer: "وجبة عائلية ٤٩ ريال" },
      { id: 19, image: adFood, shopName: "برجر فاكتوري", offer: "اطلب ٢ والثالث مجان" },
      { id: 20, image: adFood, shopName: "حلويات الأمير", offer: "كنافة طازجة يومياً" },
    ],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto relative">
      <TopBar />
      <FeaturedSlider />
      <CategoriesRow />
      {sections.map((section) => (
        <AdSection key={section.id} {...section} />
      ))}
      <div className="h-8" />
    </div>
  );
};

export default Index;
