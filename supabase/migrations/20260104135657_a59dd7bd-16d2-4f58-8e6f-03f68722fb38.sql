-- Create portfolio_items table for creators
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view portfolio items"
ON public.portfolio_items
FOR SELECT
USING (true);

CREATE POLICY "Creators can insert their own portfolio items"
ON public.portfolio_items
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own portfolio items"
ON public.portfolio_items
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own portfolio items"
ON public.portfolio_items
FOR DELETE
USING (auth.uid() = creator_id);

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Storage policies for portfolio bucket
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own portfolio images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);