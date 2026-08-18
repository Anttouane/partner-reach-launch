DROP POLICY IF EXISTS "Authenticated can read public settings" ON public.platform_settings;

CREATE POLICY "Authenticated can read public settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (setting_key IN ('partnery_commission', 'commission_rate', 'auto_release_days', 'creator_response_days'));