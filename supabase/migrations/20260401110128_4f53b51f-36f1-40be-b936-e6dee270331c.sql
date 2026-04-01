
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 1. device_tokens table
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  platform text NOT NULL DEFAULT 'unknown',
  city text,
  region_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert device tokens"
  ON public.device_tokens FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update device tokens"
  ON public.device_tokens FOR UPDATE TO public
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view device tokens"
  ON public.device_tokens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. sent_notifications table
CREATE TABLE public.sent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id integer NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  tokens_count integer DEFAULT 0,
  UNIQUE(ad_id, notification_type)
);

ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sent notifications"
  ON public.sent_notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert sent notifications"
  ON public.sent_notifications FOR INSERT TO public
  WITH CHECK (true);

-- 3. notification_settings table
CREATE TABLE public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  target_mode text NOT NULL DEFAULT 'city',
  hours_before integer NOT NULL DEFAULT 24,
  message_template text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification settings are publicly readable"
  ON public.notification_settings FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can insert notification settings"
  ON public.notification_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notification settings"
  ON public.notification_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notification settings"
  ON public.notification_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
