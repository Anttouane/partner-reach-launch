DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.platform_settings;

CREATE POLICY "Admins can view all settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));