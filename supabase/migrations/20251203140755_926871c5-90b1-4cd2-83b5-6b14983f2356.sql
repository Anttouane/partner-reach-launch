-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
('Mode & Beauté', 'mode-beaute'),
('Lifestyle', 'lifestyle'),
('Tech & Gaming', 'tech-gaming'),
('Food & Cuisine', 'food-cuisine'),
('Sport & Fitness', 'sport-fitness'),
('Voyage', 'voyage'),
('Business & Finance', 'business-finance'),
('Art & Créativité', 'art-creativite'),
('Musique', 'musique'),
('Éducation', 'education');

-- Add social links and category to profiles
ALTER TABLE public.profiles 
ADD COLUMN instagram_url TEXT,
ADD COLUMN youtube_url TEXT,
ADD COLUMN tiktok_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);