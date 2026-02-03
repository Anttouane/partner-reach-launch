-- Fix security issue: Restrict creator_profiles table to authenticated users only
DROP POLICY IF EXISTS "Everyone can view creator profiles" ON public.creator_profiles;
CREATE POLICY "Authenticated users can view creator profiles" 
ON public.creator_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue: Restrict brand_profiles table to authenticated users only
DROP POLICY IF EXISTS "Everyone can view brand profiles" ON public.brand_profiles;
CREATE POLICY "Authenticated users can view brand profiles" 
ON public.brand_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue: Restrict pitches table to authenticated users only
DROP POLICY IF EXISTS "Everyone can view active pitches" ON public.pitches;
CREATE POLICY "Authenticated users can view active pitches" 
ON public.pitches 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NOT NULL);