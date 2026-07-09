
-- Update trigger to grant superadmin to antoine@partnery.app
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'petitbisou915@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  IF NEW.email = 'antoine@partnery.app' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'::public.app_role FROM auth.users WHERE email = 'antoine@partnery.app'
ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'antoine@partnery.app'
ON CONFLICT (user_id, role) DO NOTHING;

-- pricing_config
CREATE TABLE public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network text NOT NULL CHECK (network IN ('instagram','tiktok','youtube')),
  audience_tier text NOT NULL CHECK (audience_tier IN ('1k_5k','5k_10k','10k_50k','50k_100k')),
  format text NOT NULL CHECK (format IN ('reel','post','video','integration','story')),
  price_min numeric(10,2) NOT NULL,
  price_recommended numeric(10,2) NOT NULL,
  reach_ratio_min numeric(5,2) NOT NULL,
  reach_ratio_max numeric(5,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (network, audience_tier, format)
);

GRANT SELECT ON public.pricing_config TO authenticated;
GRANT ALL ON public.pricing_config TO service_role;

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read pricing" ON public.pricing_config
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Superadmin can insert pricing" ON public.pricing_config
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update pricing" ON public.pricing_config
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can delete pricing" ON public.pricing_config
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER trg_pricing_config_updated
BEFORE UPDATE ON public.pricing_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pricing_config (network, audience_tier, format, price_min, price_recommended, reach_ratio_min, reach_ratio_max) VALUES
('instagram','1k_5k','reel',20,40,20,40),
('instagram','5k_10k','reel',50,85,20,40),
('instagram','10k_50k','reel',100,300,20,40),
('instagram','50k_100k','reel',400,800,15,30),
('tiktok','1k_5k','video',25,50,20,80),
('tiktok','5k_10k','video',50,100,20,80),
('tiktok','10k_50k','video',100,250,20,80),
('tiktok','50k_100k','video',300,550,15,60),
('youtube','10k_50k','integration',500,1000,10,20),
('youtube','50k_100k','integration',2000,3500,10,20)
ON CONFLICT (network, audience_tier, format) DO NOTHING;

-- platform_settings policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='platform_settings' AND policyname='Authenticated can read settings') THEN
    EXECUTE 'CREATE POLICY "Authenticated can read settings" ON public.platform_settings FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='platform_settings' AND policyname='Superadmin can insert settings') THEN
    EXECUTE 'CREATE POLICY "Superadmin can insert settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''superadmin''))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='platform_settings' AND policyname='Superadmin can update settings') THEN
    EXECUTE 'CREATE POLICY "Superadmin can update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''superadmin'')) WITH CHECK (public.has_role(auth.uid(), ''superadmin''))';
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

INSERT INTO public.platform_settings (setting_key, setting_value) VALUES
('partnery_commission','15'),
('auto_release_days','5'),
('creator_response_hours','48')
ON CONFLICT (setting_key) DO NOTHING;
