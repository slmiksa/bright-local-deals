
CREATE TABLE public.support_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  contact_type text NOT NULL DEFAULT 'whatsapp',
  contact_value text NOT NULL,
  icon_color text NOT NULL DEFAULT 'bg-green-500/10 text-green-600',
  sort_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support contacts are publicly readable" ON public.support_contacts FOR SELECT USING (true);
CREATE POLICY "Admins can insert support_contacts" ON public.support_contacts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update support_contacts" ON public.support_contacts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete support_contacts" ON public.support_contacts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.support_contacts (title, description, contact_type, contact_value, icon_color, sort_order) VALUES
('واتساب', 'تواصل معنا عبر الواتساب', 'whatsapp', '966500000000', 'bg-green-500/10 text-green-600', 1),
('اتصال مباشر', 'اتصل بنا مباشرة', 'phone', '+966500000000', 'bg-blue-500/10 text-blue-600', 2),
('البريد الإلكتروني', 'أرسل لنا بريد إلكتروني', 'email', 'support@example.com', 'bg-orange-500/10 text-orange-600', 3);
