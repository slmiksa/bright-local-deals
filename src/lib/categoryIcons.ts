import {
  Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper,
  Building2, Shirt, Home, Flower2, Music, Tag, Car, Book, Heart,
  Scissors, Camera, Palette, Dumbbell, Stethoscope, ShoppingBag,
  Briefcase, Plane, Baby, Dog, Wrench, Gem, Watch, Headphones,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  // English IDs
  electronics: Smartphone,
  cafes: CupSoda,
  perfumes: SprayCan,
  furniture: Lamp,
  food: ChefHat,
  events: PartyPopper,
  realestate: Building2,
  fashion: Shirt,
  flowers: Flower2,
  music: Music,
  cars: Car,
  books: Book,
  health: Stethoscope,
  sports: Dumbbell,
  photography: Camera,
  art: Palette,
  beauty: Scissors,
  shopping: ShoppingBag,
  travel: Plane,
  kids: Baby,
  pets: Dog,
  services: Wrench,
  jewelry: Gem,
  watches: Watch,
  audio: Headphones,
  jobs: Briefcase,
  charity: Heart,
  home: Home,

  // Arabic name fallbacks
  "إلكترونيات": Smartphone,
  "مقاهي": CupSoda,
  "عطور": SprayCan,
  "أثاث": Lamp,
  "مطاعم": ChefHat,
  "فعاليات": PartyPopper,
  "دعوات زواج": PartyPopper,
  "عقارات": Building2,
  "أزياء": Shirt,
  "أزياء واكسسوارات": Shirt,
  "أسر منتجة": Home,
  "الورود وزينة الأفراح": Flower2,
  "ورود": Flower2,
  "احياء الحفلات": Music,
  "حفلات": Music,
  "سيارات": Car,
  "صحة": Stethoscope,
  "رياضة": Dumbbell,
  "تجميل": Scissors,
  "أطفال": Baby,
  "حيوانات": Dog,
  "خدمات": Wrench,
  "مجوهرات": Gem,
  "ساعات": Watch,
};

export function getCategoryIcon(idOrName: string, dbIcon?: string | null): LucideIcon {
  // 1. Check db icon field against map
  if (dbIcon && iconMap[dbIcon]) return iconMap[dbIcon];
  // 2. Check id
  if (iconMap[idOrName]) return iconMap[idOrName];
  // 3. Partial match on name
  for (const key of Object.keys(iconMap)) {
    if (idOrName.includes(key) || key.includes(idOrName)) return iconMap[key];
  }
  return Tag;
}
