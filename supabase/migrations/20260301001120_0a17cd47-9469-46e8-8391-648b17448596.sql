
-- Pricing table for ad packages
CREATE TABLE public.ad_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing is publicly readable" ON public.ad_pricing FOR SELECT USING (true);
CREATE POLICY "Admins can insert pricing" ON public.ad_pricing FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pricing" ON public.ad_pricing FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pricing" ON public.ad_pricing FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- App settings table for countdown and other settings
CREATE TABLE public.app_settings (
  id text PRIMARY KEY DEFAULT 'default',
  launch_date timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.app_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON public.app_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Insert default settings row
INSERT INTO public.app_settings (id, launch_date) VALUES ('default', now() + interval '30 days');
