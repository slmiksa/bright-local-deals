
-- Drop restrictive admin SELECT policies that block anonymous access
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

-- Recreate admin view policies as PERMISSIVE
CREATE POLICY "Admins can view all ads" ON public.ads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
