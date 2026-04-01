ALTER TABLE public.notification_settings
  ADD COLUMN notification_title text NOT NULL DEFAULT 'لمحة',
  ADD COLUMN notification_subtitle text DEFAULT '';