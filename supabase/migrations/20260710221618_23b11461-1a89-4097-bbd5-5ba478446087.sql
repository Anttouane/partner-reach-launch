
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS network text,
  ADD COLUMN IF NOT EXISTS audience_tier text,
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS price_per_creator numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric,
  ADD COLUMN IF NOT EXISTS commission_amount numeric,
  ADD COLUMN IF NOT EXISTS brand_brief text;
