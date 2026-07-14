
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: notify creator when brand approves, notify brand when creator responds
CREATE OR REPLACE FUNCTION public.notify_campaign_match_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _brand_id uuid;
  _campaign_name text;
BEGIN
  SELECT brand_id, name INTO _brand_id, _campaign_name FROM public.campaigns WHERE id = NEW.campaign_id;

  -- Brand approved creator (pending -> approved)
  IF (TG_OP = 'UPDATE' AND OLD.brand_status = 'pending' AND NEW.brand_status = 'approved') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.creator_id, 'match_approved',
      'Nouvelle proposition de campagne',
      'La marque vous a sélectionné pour « ' || _campaign_name || ' ». Acceptez pour lancer la collab.',
      '/dashboard');
  END IF;

  -- Creator accepted (pending -> accepted)
  IF (TG_OP = 'UPDATE' AND OLD.creator_status = 'pending' AND NEW.creator_status = 'accepted') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (_brand_id, 'creator_accepted',
      'Créateur accepté !',
      'Un créateur a accepté votre campagne « ' || _campaign_name || ' ».',
      '/campaigns/' || NEW.campaign_id::text);
  END IF;

  -- Creator refused
  IF (TG_OP = 'UPDATE' AND OLD.creator_status = 'pending' AND NEW.creator_status = 'refused') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (_brand_id, 'creator_refused',
      'Créateur non disponible',
      'Un créateur a refusé « ' || _campaign_name || ' ».',
      '/campaigns/' || NEW.campaign_id::text);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_campaign_match_change ON public.campaign_matches;
CREATE TRIGGER trg_notify_campaign_match_change
AFTER UPDATE ON public.campaign_matches
FOR EACH ROW EXECUTE FUNCTION public.notify_campaign_match_change();

-- Notify on collab status transitions
CREATE OR REPLACE FUNCTION public.notify_collab_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _brand_id uuid;
  _campaign_name text;
BEGIN
  SELECT brand_id, name INTO _brand_id, _campaign_name FROM public.campaigns WHERE id = NEW.campaign_id;

  IF (TG_OP = 'INSERT' AND NEW.status = 'awaiting_payment') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (_brand_id, 'collab_awaiting_payment',
      'Paiement à effectuer',
      'Votre collaboration « ' || _campaign_name || ' » attend le paiement (séquestre).',
      '/collab/' || NEW.id::text);
  END IF;

  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NEW.status = 'escrowed' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (NEW.creator_id, 'collab_escrowed',
        'Fonds séquestrés',
        'Les fonds pour « ' || _campaign_name || ' » sont sécurisés. Vous pouvez livrer.',
        '/collab/' || NEW.id::text);
    ELSIF NEW.status = 'delivered' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (_brand_id, 'collab_delivered',
        'Prestation livrée',
        'Le créateur a livré « ' || _campaign_name || ' ». Validez pour libérer le paiement.',
        '/collab/' || NEW.id::text);
    ELSIF NEW.status = 'released' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (NEW.creator_id, 'collab_released',
        'Paiement libéré',
        'Votre paiement pour « ' || _campaign_name || ' » a été libéré.',
        '/collab/' || NEW.id::text);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_collab_status_change ON public.collabs;
CREATE TRIGGER trg_notify_collab_status_change
AFTER INSERT OR UPDATE ON public.collabs
FOR EACH ROW EXECUTE FUNCTION public.notify_collab_status_change();
