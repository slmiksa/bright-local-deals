import adCafe1 from "@/assets/ad-cafe-1.jpg";
import adCafe2 from "@/assets/ad-cafe-2.jpg";
import adCafe3 from "@/assets/ad-cafe-3.jpg";
import adTech1 from "@/assets/ad-tech-1.jpg";
import adTech2 from "@/assets/ad-tech-2.jpg";
import adTech3 from "@/assets/ad-tech-3.jpg";
import adPerfume1 from "@/assets/ad-perfume-1.jpg";
import adPerfume2 from "@/assets/ad-perfume-2.jpg";
import adPerfume3 from "@/assets/ad-perfume-3.jpg";
import adFurniture1 from "@/assets/ad-furniture-1.jpg";
import adFurniture2 from "@/assets/ad-furniture-2.jpg";
import adFurniture3 from "@/assets/ad-furniture-3.jpg";
import adFood1 from "@/assets/ad-food-1.jpg";
import adFood2 from "@/assets/ad-food-2.jpg";
import adFood3 from "@/assets/ad-food-3.jpg";
import adFood4 from "@/assets/ad-food-4.jpg";
import adFood5 from "@/assets/ad-food-5.jpg";
import adEvents1 from "@/assets/ad-events-1.jpg";
import adEvents2 from "@/assets/ad-events-2.jpg";
import adEvents3 from "@/assets/ad-events-3.jpg";
import adEvents4 from "@/assets/ad-events-4.jpg";
import weddingCard1 from "@/assets/wedding-card-1.jpg";
import weddingCard2 from "@/assets/wedding-card-2.jpg";
import weddingCard3 from "@/assets/wedding-card-3.jpg";
import weddingCard4 from "@/assets/wedding-card-4.jpg";
import weddingCard5 from "@/assets/wedding-card-5.jpg";

const imageMap: Record<string, string> = {
  "ad-cafe-1.jpg": adCafe1,
  "ad-cafe-2.jpg": adCafe2,
  "ad-cafe-3.jpg": adCafe3,
  "ad-tech-1.jpg": adTech1,
  "ad-tech-2.jpg": adTech2,
  "ad-tech-3.jpg": adTech3,
  "ad-perfume-1.jpg": adPerfume1,
  "ad-perfume-2.jpg": adPerfume2,
  "ad-perfume-3.jpg": adPerfume3,
  "ad-furniture-1.jpg": adFurniture1,
  "ad-furniture-2.jpg": adFurniture2,
  "ad-furniture-3.jpg": adFurniture3,
  "ad-food-1.jpg": adFood1,
  "ad-food-2.jpg": adFood2,
  "ad-food-3.jpg": adFood3,
  "ad-food-4.jpg": adFood4,
  "ad-food-5.jpg": adFood5,
  "ad-events-1.jpg": adEvents1,
  "ad-events-2.jpg": adEvents2,
  "ad-events-3.jpg": adEvents3,
  "ad-events-4.jpg": adEvents4,
  "wedding-card-1.jpg": weddingCard1,
  "wedding-card-2.jpg": weddingCard2,
  "wedding-card-3.jpg": weddingCard3,
  "wedding-card-4.jpg": weddingCard4,
  "wedding-card-5.jpg": weddingCard5,
};

export function resolveImageUrl(filename: string): string {
  return imageMap[filename] || filename;
}
