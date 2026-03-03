
-- Add featured surcharge settings to app_settings
ALTER TABLE public.app_settings
ADD COLUMN featured_surcharge numeric NOT NULL DEFAULT 50,
ADD COLUMN featured_surcharge_enabled boolean NOT NULL DEFAULT true;

-- Create terms_policies table
CREATE TABLE public.terms_policies (
  id text PRIMARY KEY DEFAULT 'default',
  content text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.terms_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Terms are publicly readable"
ON public.terms_policies
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert terms"
ON public.terms_policies
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update terms"
ON public.terms_policies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.terms_policies (id, content) VALUES ('default', '');
