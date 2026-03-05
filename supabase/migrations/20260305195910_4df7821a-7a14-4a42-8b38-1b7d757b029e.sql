-- Add media_type column to ad_images
ALTER TABLE public.ad_images ADD COLUMN media_type text NOT NULL DEFAULT 'image';

-- Add media_type column to ad_request_images  
ALTER TABLE public.ad_request_images ADD COLUMN media_type text NOT NULL DEFAULT 'image';

-- Create video storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-videos', 'ad-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-request-videos', 'ad-request-videos', true);

-- Storage policies for ad-request-videos (public upload like images)
CREATE POLICY "Anyone can upload request videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-request-videos');
CREATE POLICY "Anyone can read request videos" ON storage.objects FOR SELECT USING (bucket_id = 'ad-request-videos');

-- Storage policies for ad-videos (admin only upload)
CREATE POLICY "Admins can upload ad videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read ad videos" ON storage.objects FOR SELECT USING (bucket_id = 'ad-videos');
CREATE POLICY "Admins can delete ad videos" ON storage.objects FOR DELETE USING (bucket_id = 'ad-videos' AND public.has_role(auth.uid(), 'admin'));