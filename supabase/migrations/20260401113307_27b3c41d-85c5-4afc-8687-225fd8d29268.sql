CREATE TABLE public.manual_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  subtitle text DEFAULT '',
  target_mode text NOT NULL DEFAULT 'all',
  city text,
  sent_count integer DEFAULT 0,
  total_count integer DEFAULT 0,
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view manual notifications" ON public.manual_notifications
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert manual notifications" ON public.manual_notifications
  FOR INSERT TO public WITH CHECK (true);