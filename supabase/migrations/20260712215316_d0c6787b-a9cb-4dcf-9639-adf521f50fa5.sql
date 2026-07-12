CREATE OR REPLACE FUNCTION public.generate_campaign_matches(_campaign_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _camp record;
  _inserted integer := 0;
BEGIN
  SELECT * INTO _camp FROM public.campaigns WHERE id = _campaign_id;
  IF _camp IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.campaign_matches (campaign_id, creator_id, match_score, brand_status, creator_status)
  SELECT
    _campaign_id,
    sv.creator_id,
    LEAST(100, GREATEST(1, (COALESCE(sv.verified_followers, sv.declared_followers, 0)::numeric / GREATEST(_camp.min_audience, 1)) * 50)),
    'pending'::match_brand_status,
    'pending'::match_creator_status
  FROM public.social_verifications sv
  JOIN public.profiles p ON p.id = sv.creator_id
  WHERE sv.status = 'verified'
    AND sv.network::text = _camp.network
    AND COALESCE(sv.verified_followers, sv.declared_followers, 0) >= COALESCE(_camp.min_audience, 0)
    AND (_camp.niche_category_id IS NULL OR p.category_id = _camp.niche_category_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.campaign_matches cm
      WHERE cm.campaign_id = _campaign_id AND cm.creator_id = sv.creator_id
    );

  GET DIAGNOSTICS _inserted = ROW_COUNT;

  IF _inserted > 0 AND _camp.status = 'draft' THEN
    UPDATE public.campaigns SET status = 'matching' WHERE id = _campaign_id;
  END IF;

  RETURN _inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_campaign_matches(uuid) TO authenticated;