-- Fix security issue 1: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue 2: Restrict brand_opportunities to authenticated users only
DROP POLICY IF EXISTS "Everyone can view active opportunities" ON public.brand_opportunities;
CREATE POLICY "Authenticated users can view active opportunities" 
ON public.brand_opportunities 
FOR SELECT 
USING (status = 'active' AND auth.uid() IS NOT NULL);