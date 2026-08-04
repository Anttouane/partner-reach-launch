DROP FUNCTION IF EXISTS public.generate_campaign_matches(uuid);

CREATE OR REPLACE FUNCTION public.generate_campaign_matches(_campaign_id uuid, _limit integer DEFAULT NULL)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _camp record;
  _inserted integer := 0;
  _max integer;
BEGIN
  SELECT * INTO _camp FROM public.campaigns WHERE id = _campaign_id;
  IF _camp IS NULL THEN RETURN 0; END IF;

  _max := COALESCE(_limit, GREATEST(_camp.creators_wanted, 1) * 3);

  INSERT INTO public.campaign_matches (campaign_id, creator_id, match_score, brand_status, creator_status)
  SELECT campaign_id, creator_id, score, 'pending'::match_brand_status, 'pending'::match_creator_status
  FROM (
    SELECT
      _campaign_id AS campaign_id,
      sv.creator_id AS creator_id,
      LEAST(100, GREATEST(1, (COALESCE(sv.verified_followers, sv.declared_followers, 0)::numeric / GREATEST(_camp.min_audience, 1)) * 50)) AS score
    FROM public.social_verifications sv
    JOIN public.profiles p ON p.id = sv.creator_id
    WHERE sv.status = 'verified'
      AND sv.network::text = _camp.network
      AND COALESCE(sv.verified_followers, sv.declared_followers, 0) >= COALESCE(_camp.min_audience, 0)
      AND (_camp.niche_category_id IS NULL OR p.category_id = _camp.niche_category_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.campaign_matches cm
        WHERE cm.campaign_id = _campaign_id AND cm.creator_id = sv.creator_id
      )
    ORDER BY score DESC
    LIMIT _max
  ) ranked;

  GET DIAGNOSTICS _inserted = ROW_COUNT;

  IF _inserted > 0 AND _camp.status = 'draft' THEN
    UPDATE public.campaigns SET status = 'matching' WHERE id = _campaign_id;
  END IF;

  RETURN _inserted;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_brand_new_matches()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.campaign_id, count(*) AS nb, c.brand_id, c.name
    FROM new_matches n
    JOIN public.campaigns c ON c.id = n.campaign_id
    GROUP BY n.campaign_id, c.brand_id, c.name
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      r.brand_id,
      'new_matches',
      'Nouveaux créateurs proposés',
      r.nb || ' créateur(s) vous sont proposés pour « ' || r.name || ' ». Validez ceux qui vous intéressent.',
      '/campaigns/' || r.campaign_id::text
    );
  END LOOP;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_brand_new_matches ON public.campaign_matches;
CREATE TRIGGER trg_notify_brand_new_matches
AFTER INSERT ON public.campaign_matches
REFERENCING NEW TABLE AS new_matches
FOR EACH STATEMENT EXECUTE FUNCTION public.notify_brand_new_matches();