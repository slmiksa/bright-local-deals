
CREATE TABLE public.banner_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  city text NOT NULL DEFAULT 'all',
  link_url text,
  link_type text NOT NULL DEFAULT 'none',
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banner slides are publicly readable" ON public.banner_slides FOR SELECT USING (true);
CREATE POLICY "Admins can insert banner_slides" ON public.banner_slides FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update banner_slides" ON public.banner_slides FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete banner_slides" ON public.banner_slides FOR DELETE USING (has_role(auth.uid(), 'admin'));
