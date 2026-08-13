CREATE TABLE public.connect_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL,
  charges_enabled boolean NOT NULL DEFAULT false,
  payouts_enabled boolean NOT NULL DEFAULT false,
  details_submitted boolean NOT NULL DEFAULT false,
  requirements_due text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.connect_accounts TO authenticated;
GRANT ALL ON public.connect_accounts TO service_role;

ALTER TABLE public.connect_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connect account"
ON public.connect_accounts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view connect accounts"
ON public.connect_accounts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_connect_accounts_updated
BEFORE UPDATE ON public.connect_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
  ADD COLUMN IF NOT EXISTS stripe_payout_id text,
  ADD COLUMN IF NOT EXISTS failure_reason text;

CREATE INDEX IF NOT EXISTS idx_collabs_payment_intent ON public.collabs (stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transfer ON public.withdrawals (stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_payout ON public.withdrawals (stripe_payout_id);