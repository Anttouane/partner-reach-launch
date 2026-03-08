ALTER TABLE public.creator_profiles 
  ADD COLUMN instagram_followers integer DEFAULT NULL,
  ADD COLUMN youtube_followers integer DEFAULT NULL,
  ADD COLUMN tiktok_followers integer DEFAULT NULL;