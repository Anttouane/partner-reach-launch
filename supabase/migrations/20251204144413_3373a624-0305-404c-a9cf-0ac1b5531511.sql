-- Create withdrawals table for creator wallet
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  iban text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  notes text
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can request withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update withdrawal status
CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));