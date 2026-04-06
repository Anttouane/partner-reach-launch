
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;

-- Create a new policy requiring authentication
CREATE POLICY "Authenticated users can view settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
