
CREATE TYPE public.campaign_status AS ENUM ('draft','matching','active','completed','cancelled');
CREATE TYPE public.match_brand_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.match_creator_status AS ENUM ('pending','accepted','refused');
CREATE TYPE public.collab_status AS ENUM ('awaiting_payment','escrowed','delivered','released','refunded','disputed');

ALTER TABLE public.creator_profiles
  ADD COLUMN IF NOT EXISTS audience_size INTEGER,
  ADD COLUMN IF NOT EXISTS rate_per_collab NUMERIC(10,2);

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget_total NUMERIC(10,2) NOT NULL,
  creators_wanted INTEGER NOT NULL DEFAULT 1,
  niche_category_id UUID REFERENCES public.categories(id),
  min_audience INTEGER NOT NULL DEFAULT 0,
  deadline DATE,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.campaign_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  brand_status public.match_brand_status NOT NULL DEFAULT 'pending',
  creator_status public.match_creator_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, creator_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_matches TO authenticated;
GRANT ALL ON public.campaign_matches TO service_role;
ALTER TABLE public.campaign_matches ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.collabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.campaign_matches(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.collab_status NOT NULL DEFAULT 'awaiting_payment',
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collabs TO authenticated;
GRANT ALL ON public.collabs TO service_role;
ALTER TABLE public.collabs ENABLE ROW LEVEL SECURITY;

-- Policies (after all tables exist)
CREATE POLICY "brand manages own campaigns" ON public.campaigns
  FOR ALL TO authenticated USING (auth.uid() = brand_id) WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "admin sees all campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "creator sees campaigns via matches" ON public.campaigns
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.campaign_matches m
      WHERE m.campaign_id = campaigns.id AND m.creator_id = auth.uid() AND m.brand_status = 'approved')
  );

CREATE POLICY "brand manages matches" ON public.campaign_matches
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()));
CREATE POLICY "creator sees own approved matches" ON public.campaign_matches
  FOR SELECT TO authenticated USING (creator_id = auth.uid() AND brand_status = 'approved');
CREATE POLICY "creator updates own match decision" ON public.campaign_matches
  FOR UPDATE TO authenticated USING (creator_id = auth.uid() AND brand_status = 'approved')
  WITH CHECK (creator_id = auth.uid());
CREATE POLICY "admin sees all matches" ON public.campaign_matches
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "brand manages own collabs" ON public.collabs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()));
CREATE POLICY "creator sees own collabs" ON public.collabs
  FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "creator updates delivery" ON public.collabs
  FOR UPDATE TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "admin sees all collabs" ON public.collabs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campaign_matches_updated BEFORE UPDATE ON public.campaign_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_collabs_updated BEFORE UPDATE ON public.collabs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
