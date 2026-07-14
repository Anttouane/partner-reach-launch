
ALTER TABLE public.collabs
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_release_at timestamptz,
  ADD COLUMN IF NOT EXISTS released_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_charge_id text;

CREATE OR REPLACE FUNCTION public.set_collab_delivery_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _delay_days integer := 7;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
      NEW.delivered_at := now();
      NEW.auto_release_at := now() + (_delay_days || ' days')::interval;
    ELSIF NEW.status = 'released' AND NEW.released_at IS NULL THEN
      NEW.released_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_collab_delivery_deadline ON public.collabs;
CREATE TRIGGER trg_set_collab_delivery_deadline
BEFORE UPDATE ON public.collabs
FOR EACH ROW EXECUTE FUNCTION public.set_collab_delivery_deadline();

CREATE INDEX IF NOT EXISTS idx_collabs_auto_release
  ON public.collabs(auto_release_at) WHERE status = 'delivered';
