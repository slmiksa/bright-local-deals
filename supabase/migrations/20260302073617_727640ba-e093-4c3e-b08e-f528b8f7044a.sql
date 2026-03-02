
-- Drop all RESTRICTIVE SELECT policies and recreate as PERMISSIVE

-- categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- cities
DROP POLICY IF EXISTS "Cities are publicly readable" ON public.cities;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);

-- ads
DROP POLICY IF EXISTS "Active ads are publicly readable" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;
CREATE POLICY "Active ads are publicly readable" ON public.ads FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all ads" ON public.ads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ad_images
DROP POLICY IF EXISTS "Ad images are publicly readable" ON public.ad_images;
CREATE POLICY "Ad images are publicly readable" ON public.ad_images FOR SELECT USING (true);

-- ad_stats
DROP POLICY IF EXISTS "Ad stats are publicly readable" ON public.ad_stats;
CREATE POLICY "Ad stats are publicly readable" ON public.ad_stats FOR SELECT USING (true);

-- ad_pricing
DROP POLICY IF EXISTS "Pricing is publicly readable" ON public.ad_pricing;
CREATE POLICY "Pricing is publicly readable" ON public.ad_pricing FOR SELECT USING (true);

-- app_settings
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.app_settings;
CREATE POLICY "Settings are publicly readable" ON public.app_settings FOR SELECT USING (true);
