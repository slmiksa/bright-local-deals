import {
  Smartphone, CupSoda, ChefHat, PartyPopper,
  Music, Flower2, Building2, Shirt, CookingPot, Megaphone, Tag,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  // Exact database IDs
  "electronics": Smartphone,
  "cafes": CupSoda,
  "events": PartyPopper,
  "food": ChefHat,
  "Music": Music,
  "Rose and events": Flower2,
  "Building": Building2,
  "Accessories": Shirt,
  "Family": CookingPot,
  "Public": Megaphone,

  // Icon field values from DB
  "Smartphone": Smartphone,
  "CupSoda": CupSoda,
  "ChefHat": ChefHat,
  "PartyPopper": PartyPopper,
  "music": Music,
  "building": Building2,
  "Flower2": Flower2,
  "Shirt": Shirt,
  "CookingPot": CookingPot,
  "Megaphone": Megaphone,
};

export function getCategoryIcon(id: string, dbIcon?: string | null): LucideIcon {
  if (dbIcon && iconMap[dbIcon]) return iconMap[dbIcon];
  if (iconMap[id]) return iconMap[id];
  return Tag;
}
