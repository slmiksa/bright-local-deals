
-- Create regions table
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on regions
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS policies for regions
CREATE POLICY "Regions are publicly readable" ON public.regions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert regions" ON public.regions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update regions" ON public.regions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete regions" ON public.regions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add region_id and is_default to cities
ALTER TABLE public.cities ADD COLUMN region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL;
ALTER TABLE public.cities ADD COLUMN is_default boolean NOT NULL DEFAULT false;
