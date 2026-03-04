
-- Create ad_requests table
CREATE TABLE public.ad_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number serial NOT NULL UNIQUE,
  ad_type text NOT NULL,
  ad_tier text NOT NULL DEFAULT 'عادي',
  store_name text NOT NULL,
  city text NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert (anyone can submit a request)
CREATE POLICY "Anyone can submit ad requests"
ON public.ad_requests FOR INSERT
WITH CHECK (true);

-- Public can read their own request by id (for order confirmation)
CREATE POLICY "Ad requests are publicly readable"
ON public.ad_requests FOR SELECT
USING (true);

-- Admins can update
CREATE POLICY "Admins can update ad_requests"
ON public.ad_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete ad_requests"
ON public.ad_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create ad_request_images table
CREATE TABLE public.ad_request_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.ad_requests(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_main boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_request_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert request images"
ON public.ad_request_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Request images are publicly readable"
ON public.ad_request_images FOR SELECT
USING (true);

CREATE POLICY "Admins can delete request images"
ON public.ad_request_images FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for request images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-request-images', 'ad-request-images', true);

-- Storage policies
CREATE POLICY "Anyone can upload request images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-request-images');

CREATE POLICY "Request images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-request-images');

CREATE POLICY "Admins can delete request images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ad-request-images' AND has_role(auth.uid(), 'admin'::app_role));
