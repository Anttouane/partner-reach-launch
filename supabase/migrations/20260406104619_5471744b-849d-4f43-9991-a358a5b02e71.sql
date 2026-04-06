-- Remove client INSERT policy on payments - payments should only be created server-side via edge function
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;