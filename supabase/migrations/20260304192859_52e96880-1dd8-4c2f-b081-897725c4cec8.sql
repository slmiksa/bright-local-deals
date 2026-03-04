CREATE TABLE public.popup_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  city text NOT NULL,
  link_url text,
  link_type text NOT NULL DEFAULT 'internal',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.popup_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Popup ads are publicly readable" ON public.popup_ads FOR SELECT USING (true);
CREATE POLICY "Admins can insert popup_ads" ON public.popup_ads FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update popup_ads" ON public.popup_ads FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete popup_ads" ON public.popup_ads FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));