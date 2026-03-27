ALTER TABLE public.app_settings 
ADD COLUMN min_required_version text DEFAULT '1.1.0',
ADD COLUMN update_message text DEFAULT 'يوجد تحديث جديد، يرجى التحديث للاستمرار',
ADD COLUMN force_update boolean DEFAULT false;