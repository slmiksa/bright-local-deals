-- Create categories table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ads table
CREATE TABLE public.ads (
  id SERIAL PRIMARY KEY,
  shop_name TEXT NOT NULL,
  offer TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL REFERENCES public.categories(id),
  city TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ad_images table
CREATE TABLE public.ad_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id INT NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ad_stats table
CREATE TABLE public.ad_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id INT NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ad_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_stats ENABLE ROW LEVEL SECURITY;

-- Public read policies (public ad board, no auth needed)
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Active ads are publicly readable" ON public.ads FOR SELECT USING (active = true);
CREATE POLICY "Ad images are publicly readable" ON public.ad_images FOR SELECT USING (true);
CREATE POLICY "Ad stats are publicly readable" ON public.ad_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can update ad stats" ON public.ad_stats FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert ad stats" ON public.ad_stats FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_ads_category ON public.ads(category);
CREATE INDEX idx_ads_city ON public.ads(city);
CREATE INDEX idx_ads_featured ON public.ads(featured) WHERE featured = true;
CREATE INDEX idx_ad_images_ad_id ON public.ad_images(ad_id);
CREATE INDEX idx_ad_stats_ad_id ON public.ad_stats(ad_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ad_stats_updated_at BEFORE UPDATE ON public.ad_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);
CREATE POLICY "Ad images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Anyone can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images');