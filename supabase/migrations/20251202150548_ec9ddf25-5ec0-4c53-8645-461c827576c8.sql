-- Create payments table to track transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payer_id UUID NOT NULL,
  payee_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  commission_amount INTEGER NOT NULL, -- Platform commission in cents
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- Commission percentage
  net_amount INTEGER NOT NULL, -- Amount after commission
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  conversation_id UUID REFERENCES public.conversations(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view payments they're involved in
CREATE POLICY "Users can view their payments"
ON public.payments
FOR SELECT
USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Users can create payments as payer
CREATE POLICY "Users can create payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = payer_id);

-- Only system can update payments (via service role)
CREATE POLICY "Users can view payment updates"
ON public.payments
FOR UPDATE
USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Platform settings table for commission rate
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can view settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Insert default commission rate (10%)
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES ('commission_rate', '10');