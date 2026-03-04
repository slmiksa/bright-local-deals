ALTER TABLE public.ads ADD COLUMN start_date timestamp with time zone DEFAULT now();
ALTER TABLE public.ads ADD COLUMN end_date timestamp with time zone;