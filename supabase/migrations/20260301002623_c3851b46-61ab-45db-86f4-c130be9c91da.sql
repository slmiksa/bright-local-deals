
-- Fix: Drop restrictive SELECT policies and recreate as PERMISSIVE for public tables

-- categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- cities
DROP POLICY IF EXISTS "Cities are publicly readable" ON public.cities;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT TO anon, authenticated USING (true);

-- ads
DROP POLICY IF EXISTS "Active ads are publicly readable" ON public.ads;
CREATE POLICY "Active ads are publicly readable" ON public.ads FOR SELECT TO anon, authenticated USING (active = true);

-- ad_images
DROP POLICY IF EXISTS "Ad images are publicly readable" ON public.ad_images;
CREATE POLICY "Ad images are publicly readable" ON public.ad_images FOR SELECT TO anon, authenticated USING (true);

-- ad_stats
DROP POLICY IF EXISTS "Ad stats are publicly readable" ON public.ad_stats;
CREATE POLICY "Ad stats are publicly readable" ON public.ad_stats FOR SELECT TO anon, authenticated USING (true);

-- ad_pricing
DROP POLICY IF EXISTS "Pricing is publicly readable" ON public.ad_pricing;
CREATE POLICY "Pricing is publicly readable" ON public.ad_pricing FOR SELECT TO anon, authenticated USING (true);

-- app_settings
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.app_settings;
CREATE POLICY "Settings are publicly readable" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

-- ad_stats insert/update for anonymous
DROP POLICY IF EXISTS "Anyone can insert ad stats" ON public.ad_stats;
CREATE POLICY "Anyone can insert ad stats" ON public.ad_stats FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update ad stats" ON public.ad_stats;
CREATE POLICY "Anyone can update ad stats" ON public.ad_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
