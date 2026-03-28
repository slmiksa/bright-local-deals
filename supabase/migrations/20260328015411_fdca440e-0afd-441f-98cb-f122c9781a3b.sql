
-- Create giveaways table
CREATE TABLE public.giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prize text NOT NULL,
  end_date timestamptz NOT NULL,
  snapchat_url text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT false,
  winner_name text,
  sponsor_name text,
  sponsor_logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create giveaway_entries table
CREATE TABLE public.giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, phone)
);

-- Enable RLS
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

-- Giveaways RLS: public read, admin write
CREATE POLICY "Giveaways are publicly readable" ON public.giveaways FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert giveaways" ON public.giveaways FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update giveaways" ON public.giveaways FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete giveaways" ON public.giveaways FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Giveaway entries RLS: public read & insert, admin delete
CREATE POLICY "Entries are publicly readable" ON public.giveaway_entries FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can register for giveaway" ON public.giveaway_entries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can delete entries" ON public.giveaway_entries FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public) VALUES ('giveaway-images', 'giveaway-images', true);

-- Storage RLS
CREATE POLICY "Giveaway images are publicly readable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'giveaway-images');
CREATE POLICY "Admins can upload giveaway images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'giveaway-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete giveaway images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'giveaway-images' AND has_role(auth.uid(), 'admin'));
