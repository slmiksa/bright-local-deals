export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "moderator" | "user";

export interface AdRow {
  id: number;
  images: string[];
  shop_name: string;
  offer: string;
  featured: boolean;
  category: string;
  city: string;
  phone: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface AdInsert {
  id?: number;
  images: string[];
  shop_name: string;
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

export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}
