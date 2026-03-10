
-- Update RLS policy to allow brands to see their own opportunities regardless of status
DROP POLICY IF EXISTS "Authenticated users can view active opportunities" ON public.brand_opportunities;

CREATE POLICY "Authenticated users can view opportunities" ON public.brand_opportunities
FOR SELECT TO public
USING (
  (status = 'active' AND auth.uid() IS NOT NULL)
  OR (auth.uid() = brand_id)
);

-- Same for pitches: creators should see their own pitches regardless of status
DROP POLICY IF EXISTS "Authenticated users can view active pitches" ON public.pitches;

CREATE POLICY "Authenticated users can view pitches" ON public.pitches
FOR SELECT TO public
USING (
  (status = 'active' AND auth.uid() IS NOT NULL)
  OR (auth.uid() = creator_id)
);
