
-- Social verifications: hybrid mode (declared link/stats + admin manual verify)
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.social_network AS ENUM ('instagram', 'tiktok', 'youtube');

CREATE TABLE public.social_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  network public.social_network NOT NULL,
  handle text NOT NULL,
  profile_url text NOT NULL,
  declared_followers integer NOT NULL CHECK (declared_followers >= 0),
  declared_avg_views integer CHECK (declared_avg_views >= 0),
  declared_engagement numeric(5,2) CHECK (declared_engagement >= 0 AND declared_engagement <= 100),
  screenshot_url text,
  status public.verification_status NOT NULL DEFAULT 'pending',
  verified_followers integer,
  verified_avg_views integer,
  verified_engagement numeric(5,2),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  rejection_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_id, network)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_verifications TO authenticated;
GRANT ALL ON public.social_verifications TO service_role;

ALTER TABLE public.social_verifications ENABLE ROW LEVEL SECURITY;

-- Creator manages their own
CREATE POLICY "Creator reads own verifications"
  ON public.social_verifications FOR SELECT TO authenticated
  USING (auth.uid() = creator_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Creator inserts own verifications"
  ON public.social_verifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Creator can edit only while pending or rejected (resubmit); admins can always update
CREATE POLICY "Creator updates own pending, admin updates any"
  ON public.social_verifications FOR UPDATE TO authenticated
  USING (
    (auth.uid() = creator_id AND status IN ('pending','rejected'))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'superadmin')
  );

CREATE POLICY "Creator deletes own"
  ON public.social_verifications FOR DELETE TO authenticated
  USING (auth.uid() = creator_id OR public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER trg_social_verifications_updated_at
  BEFORE UPDATE ON public.social_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brand-facing helper: is a creator verified on at least one network?
CREATE OR REPLACE FUNCTION public.is_creator_verified(_creator_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.social_verifications
    WHERE creator_id = _creator_id AND status = 'verified'
  )
$$;
