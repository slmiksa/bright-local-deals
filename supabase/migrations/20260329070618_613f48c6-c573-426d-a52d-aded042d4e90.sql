CREATE TABLE public.success_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.success_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are publicly readable" ON public.success_partners FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert partners" ON public.success_partners FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update partners" ON public.success_partners FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete partners" ON public.success_partners FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));