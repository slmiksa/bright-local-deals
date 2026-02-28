
-- Allow admins to upload to ad-images bucket
CREATE POLICY "Admins can upload ad images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-images' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete from ad-images bucket
CREATE POLICY "Admins can delete ad images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ad-images' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow public read access to ad-images bucket
CREATE POLICY "Public can read ad images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ad-images');
