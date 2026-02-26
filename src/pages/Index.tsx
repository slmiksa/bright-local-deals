import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import AdSection from "@/components/AdSection";
import BottomTabBar from "@/components/BottomTabBar";

import featuredCoffee from "@/assets/featured-coffee.jpg";
import featuredElectronics from "@/assets/featured-electronics.jpg";
import featuredPerfume from "@/assets/featured-perfume.jpg";

const sections = [
  {
    id: "electronics",
    title: "إلكترونيات",
    ads: [
      { id: 1, image: featuredElectronics, shopName: "متجر التقنية", offer: "خصم 20% على الأجهزة", featured: true },
      { id: 2, image: featuredElectronics, shopName: "عالم الجوالات", offer: "أحدث الموديلات" },
      { id: 3, image: featuredElectronics, shopName: "حلول الكمبيوتر", offer: "صيانة مجانية" },
      { id: 4, image: featuredElectronics, shopName: "ملحقات ذكية", offer: "عرض اليوم فقط", featured: true },
    ],
  },
  {
    id: "cafes",
    title: "كافيهات",
    ads: [
      { id: 5, image: featuredCoffee, shopName: "كافيه الديوان", offer: "قهوة مختصة + حلى", featured: true },
      { id: 6, image: featuredCoffee, shopName: "بن الشيوخ", offer: "أجواء تراثية مميزة" },
      { id: 7, image: featuredCoffee, shopName: "قهوة المساء", offer: "جلسات خارجية" },
      { id: 8, image: featuredCoffee, shopName: "روقان كافيه", offer: "عرض الويكند" },
    ],
  },
  {
    id: "perfumes",
    title: "عطور وروائح",
    ads: [
      { id: 9, image: featuredPerfume, shopName: "دار العود", offer: "عود فاخر بأسعار مميزة", featured: true },
      { id: 10, image: featuredPerfume, shopName: "عطور الخليج", offer: "بخور ودهن عود" },
      { id: 11, image: featuredPerfume, shopName: "روائح الشرق", offer: "تشكيلة فرنسية" },
      { id: 12, image: featuredPerfume, shopName: "مسك الختام", offer: "هدايا جاهزة", featured: true },
    ],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24 max-w-[430px] mx-auto">
      <TopBar />
      <FeaturedSlider />
      <CategoriesRow />
      {sections.map((section) => (
        <AdSection key={section.id} {...section} />
      ))}
    </div>
  );
};

export default Index;
